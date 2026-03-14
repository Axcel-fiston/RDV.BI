package com.rdvbi.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "time_slots")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @Builder.Default
    @Column(nullable = false)
    private Integer capacity = 1;

    @Builder.Default
    @Column(nullable = false)
    private Integer bookedCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean blocked = false;

    @Column(length = 1000)
    private String blockReason;
}
