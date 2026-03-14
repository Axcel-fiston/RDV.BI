package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record AppointmentOtpVerificationRequest(
        @JsonProperty("code") @NotBlank String code,
        @JsonProperty("customer_phone") @NotBlank String customerPhone
) {}
