package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CounterRequest(
        @NotBlank @Size(max = 50) String number,
        @JsonProperty("staff_name") @Size(max = 255) String staffName,
        @JsonProperty("is_active") Boolean active
) {}
