package com.rdvbi.backend.controllers;

import com.rdvbi.backend.dto.AuthDtos.*;
import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.entities.User;
import com.rdvbi.backend.enums.UserRole;
import com.rdvbi.backend.enums.InstitutionStatus;
import com.rdvbi.backend.repositories.InstitutionRepository;
import com.rdvbi.backend.repositories.UserRepository;
import com.rdvbi.backend.security.CustomUserDetails;
import com.rdvbi.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElse(null);
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            return ResponseEntity.status(403).body(Map.of("error", "Invalid email or password"));
        }
        if (!Boolean.TRUE.equals(user.getActive())) {
            return ResponseEntity.status(403).body(Map.of("error", "User account is inactive"));
        }
        if (user.getRole() != UserRole.PLATFORM_ADMIN
                && user.getInstitution() != null
                && user.getInstitution().getStatus() != InstitutionStatus.APPROVED) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution is pending approval"));
        }
        return ResponseEntity.ok(buildTokens(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        String subjectEmail = jwtService.extractSubject(request.refreshToken());
        User user = userRepository.findByEmail(subjectEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(buildTokens(user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfo> me(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(toUserInfo(principal.user()));
    }

    // Simple helper to create the first admin; remove/lock in production
    @PostMapping("/bootstrap-admin")
    public ResponseEntity<?> bootstrap(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.getOrDefault("fullName", "Admin");
        String institutionId = body.get("institutionId");

        if (email == null || password == null || institutionId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email, password and institutionId are required"));
        }

        String normalizedEmail = email.trim().toLowerCase();
        Institution institution = institutionRepository.findById(UUID.fromString(institutionId))
                .orElseThrow(() -> new IllegalArgumentException("Institution not found"));

        User user = userRepository.findByEmail(normalizedEmail)
                .map(existing -> {
                    if (!existing.getInstitution().getId().equals(institution.getId())) {
                        throw new IllegalArgumentException("Email already belongs to another institution");
                    }
                    existing.setPasswordHash(passwordEncoder.encode(password));
                    existing.setFullName(fullName);
                    existing.setRole(UserRole.ADMIN);
                    existing.setActive(true);
                    return existing;
                })
                .orElseGet(() -> User.builder()
                        .email(normalizedEmail)
                        .passwordHash(passwordEncoder.encode(password))
                        .fullName(fullName)
                        .role(UserRole.ADMIN)
                        .institution(institution)
                        .active(true)
                        .build());

        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "status", "ready",
                "email", normalizedEmail,
                "institutionId", institution.getId()
        ));
    }

    @PostMapping("/bootstrap-platform-admin")
    public ResponseEntity<?> bootstrapPlatformAdmin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.getOrDefault("fullName", "Platform Admin");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password are required"));
        }

        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .map(existing -> {
                    existing.setPasswordHash(passwordEncoder.encode(password));
                    existing.setFullName(fullName);
                    existing.setRole(UserRole.PLATFORM_ADMIN);
                    existing.setInstitution(null);
                    existing.setActive(true);
                    return existing;
                })
                .orElseGet(() -> User.builder()
                        .email(normalizedEmail)
                        .passwordHash(passwordEncoder.encode(password))
                        .fullName(fullName)
                        .role(UserRole.PLATFORM_ADMIN)
                        .active(true)
                        .build());

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("status", "ready", "email", normalizedEmail));
    }

    private AuthResponse buildTokens(User user) {
        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user);
        return AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .user(toUserInfo(user))
                .build();
    }

    private UserInfo toUserInfo(User user) {
        return UserInfo.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .institutionId(user.getInstitution() != null ? user.getInstitution().getId().toString() : null)
                .institutionName(user.getInstitution() != null ? user.getInstitution().getName() : null)
                .build();
    }
}
