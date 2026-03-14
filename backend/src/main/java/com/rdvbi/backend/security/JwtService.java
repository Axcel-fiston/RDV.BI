package com.rdvbi.backend.security;

import com.rdvbi.backend.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtService {

    private final javax.crypto.SecretKey key;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-ttl-seconds:900}") long accessTtlSeconds,
            @Value("${security.jwt.refresh-ttl-seconds:604800}") long refreshTtlSeconds) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    public String generateAccessToken(User user) {
        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("role", user.getRole().name());
        if (user.getInstitution() != null) {
            claims.put("institutionId", user.getInstitution().getId().toString());
        }
        return buildToken(user, accessTtlSeconds, claims);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, refreshTtlSeconds, Map.of("type", "refresh"));
    }

    public String extractSubject(String token) {
        return extractClaims(token).getSubject();
    }

    public Claims extractClaims(String token) {
        return (Claims) Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String buildToken(User user, long ttlSeconds, Map<String, Object> extraClaims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                .claims(extraClaims)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
