package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentRequest(
        @NotNull UUID institutionId,
        @NotNull UUID serviceId,
        @NotNull UUID timeSlotId,
        @NotBlank String customerPhone,
        @Email String customerEmail,
        @NotNull LocalDate appointmentDate,
        @NotNull LocalTime appointmentTime,
        @NotBlank String ticketNumber,
        @JsonProperty("customer_name") @NotBlank String customerName
) {}
