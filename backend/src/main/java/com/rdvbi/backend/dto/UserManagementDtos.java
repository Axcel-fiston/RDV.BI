package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rdvbi.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

public class UserManagementDtos {

    public record CreateUserRequest(
            @Email @NotBlank String email,
            @JsonProperty("full_name") @NotBlank String fullName,
            @NotNull UserRole role,
            @NotBlank String password,
            Boolean active
    ) {}

    public record UpdateUserRequest(
            @Email String email,
            @JsonProperty("full_name") String fullName,
            UserRole role,
            String password,
            Boolean active
    ) {}

    @Builder
    public record UserResponse(
            String id,
            String email,
            String fullName,
            UserRole role,
            Boolean active,
            String institutionId,
            String institutionName
    ) {}
}
