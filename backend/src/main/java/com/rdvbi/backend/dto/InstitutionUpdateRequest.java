package com.rdvbi.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record InstitutionUpdateRequest(
        String name,
        String slug,
        String type,
        String address,
        @JsonProperty("phone") String contactPhone,
        @JsonProperty("email") String contactEmail,
        @JsonProperty("logo_url") String logoUrl,
        @JsonProperty("is_active") Boolean active
) {}
