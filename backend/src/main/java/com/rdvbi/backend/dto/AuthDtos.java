package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rdvbi.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

public class AuthDtos {

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record RefreshRequest(
            @NotBlank @JsonProperty("refresh_token") String refreshToken
    ) {}

    @Builder
    public record AuthResponse(
            String accessToken,
            String refreshToken,
            UserInfo user
    ) {}

    @Builder
    public record UserInfo(
            String id,
            String email,
            String fullName,
            UserRole role,
            String institutionId,
            String institutionName
    ) {}
}
