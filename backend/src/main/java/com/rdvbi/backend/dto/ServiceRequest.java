package com.rdvbi.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ServiceRequest(
        @NotBlank String name,
        String description,
        @NotNull @Positive Integer durationMinutes,
        String prefix,
        Boolean active
) {}
