package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rdvbi.backend.enums.CounterStatus;

public record CounterUpdateRequest(
        String number,
        @JsonProperty("staff_name") String staffName,
        @JsonProperty("is_active") Boolean active,
        CounterStatus status,
        @JsonProperty("current_ticket") String currentTicket
) {}
