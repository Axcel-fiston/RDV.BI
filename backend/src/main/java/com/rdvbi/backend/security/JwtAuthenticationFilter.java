package com.rdvbi.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = jwtService.extractClaims(token);
            String subject = claims.getSubject();
            if (subject != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(subject);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                if (userDetails instanceof CustomUserDetails) {
                    CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
                    if (customUserDetails.user().getInstitution() != null) {
                        auth.setDetails(new InstitutionDetails(customUserDetails.user().getInstitution().getId()));
                    }
                } else {
                    String instId = claims.get("institutionId", String.class);
                    if (instId != null) {
                        auth.setDetails(new InstitutionDetails(UUID.fromString(instId)));
                    }
                }
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (JwtException | IllegalArgumentException e) {
            // invalid token, continue without setting auth
        }
        filterChain.doFilter(request, response);
    }

    public static class InstitutionDetails {
        private final UUID institutionId;
        public InstitutionDetails(UUID institutionId) {
            this.institutionId = institutionId;
        }
        public UUID getInstitutionId() {
            return institutionId;
        }
    }
}
