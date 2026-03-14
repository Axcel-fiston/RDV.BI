package com.rdvbi.backend.dto;

import lombok.Builder;

@Builder
public record InstitutionReviewResponse(
        String id,
        String name,
        String slug,
        String type,
        String contactEmail,
        String contactPhone,
        String address,
        String description,
        String logoUrl,
        String status,
        String approvalNotes,
        String createdAt,
        String approvedAt,
        String rejectedAt,
        String adminFullName,
        String adminEmail
) {}
