package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalTime;

public record TimeSlotUpdateRequest(
        LocalDate date,
        @JsonProperty("start_time") LocalTime startTime,
        @JsonProperty("end_time") LocalTime endTime,
        Integer capacity,
        @JsonProperty("is_blocked") Boolean blocked,
        @JsonProperty("block_reason") String blockReason
) {}
