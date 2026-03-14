package com.rdvbi.backend.entities;

import com.rdvbi.backend.enums.CounterStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "counters", uniqueConstraints = @UniqueConstraint(columnNames = {"institution_id", "number"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Counter {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false, length = 50)
    private String number;

    @Column(length = 255)
    private String staffName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CounterStatus status = CounterStatus.AVAILABLE;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(length = 50)
    private String currentTicket;

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
