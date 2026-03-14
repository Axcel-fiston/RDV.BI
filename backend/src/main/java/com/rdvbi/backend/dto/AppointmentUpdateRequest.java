package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rdvbi.backend.enums.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AppointmentUpdateRequest(
        @JsonProperty("status") AppointmentStatus status,
        @JsonProperty("appointment_date") LocalDate appointmentDate,
        @JsonProperty("appointment_time") LocalTime appointmentTime,
        @JsonProperty("time_slot_id") UUID timeSlotId,
        @JsonProperty("ticket_number") String ticketNumber,
        @JsonProperty("customer_email") String customerEmail,
        @JsonProperty("customer_phone") String customerPhone,
        @JsonProperty("counter_number") String counterNumber,
        @JsonProperty("called_time") OffsetDateTime calledTime,
        @JsonProperty("completed_time") OffsetDateTime completedTime
) {}
