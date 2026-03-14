package com.rdvbi.backend.entities;

import com.rdvbi.backend.enums.InstitutionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "institutions", uniqueConstraints = {@UniqueConstraint(columnNames = "slug")})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Institution {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 120)
    private String slug;

    private String type;
    private String contactEmail;
    private String contactPhone;
    private String address;

    @Column(length = 2000)
    private String description;

    private String logoUrl;
    private Double locationLat;
    private Double locationLng;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InstitutionStatus status = InstitutionStatus.PENDING;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    private String approvalNotes;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
