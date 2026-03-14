package com.rdvbi.backend.controllers;

import com.rdvbi.backend.dto.UserManagementDtos.CreateUserRequest;
import com.rdvbi.backend.dto.UserManagementDtos.UpdateUserRequest;
import com.rdvbi.backend.dto.UserManagementDtos.UserResponse;
import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.entities.User;
import com.rdvbi.backend.repositories.InstitutionRepository;
import com.rdvbi.backend.repositories.UserRepository;
import com.rdvbi.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UserResponse> listUsers(@AuthenticationPrincipal CustomUserDetails principal) {
        Institution institution = principal.user().getInstitution();
        return userRepository.findByInstitutionOrderByFullNameAsc(institution).stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@AuthenticationPrincipal CustomUserDetails principal,
                                        @Valid @RequestBody CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        Institution institution = loadInstitution(principal.user().getInstitution().getId());
        User user = User.builder()
                .email(request.email().trim().toLowerCase())
                .fullName(request.fullName().trim())
                .role(request.role())
                .passwordHash(passwordEncoder.encode(request.password()))
                .institution(institution)
                .active(request.active() == null ? true : request.active())
                .build();

        return ResponseEntity.status(201).body(toResponse(userRepository.save(user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@AuthenticationPrincipal CustomUserDetails principal,
                                        @PathVariable UUID id,
                                        @Valid @RequestBody UpdateUserRequest request) {
        Institution institution = loadInstitution(principal.user().getInstitution().getId());

        return userRepository.findByIdAndInstitution(id, institution)
                .<ResponseEntity<?>>map(user -> {
                    if (request.email() != null) {
                        String normalizedEmail = request.email().trim().toLowerCase();
                        if (!normalizedEmail.equals(user.getEmail()) && userRepository.existsByEmail(normalizedEmail)) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
                        }
                        user.setEmail(normalizedEmail);
                    }
                    if (request.fullName() != null) {
                        user.setFullName(request.fullName().trim());
                    }
                    if (request.role() != null) {
                        user.setRole(request.role());
                    }
                    if (request.password() != null && !request.password().isBlank()) {
                        user.setPasswordHash(passwordEncoder.encode(request.password()));
                    }
                    if (request.active() != null) {
                        user.setActive(request.active());
                    }
                    return ResponseEntity.ok(toResponse(userRepository.save(user)));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateUser(@AuthenticationPrincipal CustomUserDetails principal,
                                            @PathVariable UUID id) {
        Institution institution = loadInstitution(principal.user().getInstitution().getId());

        return userRepository.findByIdAndInstitution(id, institution)
                .<ResponseEntity<?>>map(user -> {
                    user.setActive(false);
                    userRepository.save(user);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    private Institution loadInstitution(UUID institutionId) {
        return institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException("Institution not found"));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .active(user.getActive())
                .institutionId(user.getInstitution().getId().toString())
                .institutionName(user.getInstitution().getName())
                .build();
    }
}
