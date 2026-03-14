package com.rdvbi.backend.repositories;

import com.rdvbi.backend.entities.TimeSlot;
import com.rdvbi.backend.entities.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {
    List<TimeSlot> findByInstitutionOrderByDateAscStartTimeAsc(Institution institution);
    List<TimeSlot> findByInstitutionAndDateOrderByStartTimeAsc(Institution institution, LocalDate date);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TimeSlot> findWithLockingById(UUID id);
}
