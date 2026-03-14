package com.rdvbi.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record InstitutionRegistrationRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank @Pattern(regexp = "^[a-z0-9-]+$") String slug,
        String type,
        @Email String contactEmail,
        @NotBlank String contactPhone,
        String address,
        String description,
        String logoUrl,
        Double locationLat,
        Double locationLng,
        @NotBlank @Size(min = 2, max = 255) String adminFullName,
        @Email @NotBlank String adminEmail,
        @NotBlank @Size(min = 8, max = 255) String adminPassword
) {}
