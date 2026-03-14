package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ServiceUpdateRequest(
        String name,
        String description,
        @JsonProperty("duration_minutes") Integer durationMinutes,
        String prefix,
        @JsonProperty("is_active") Boolean active
) {}
