package com.rdvbi.backend.repositories;

import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.enums.InstitutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstitutionRepository extends JpaRepository<Institution, UUID> {
    Optional<Institution> findBySlug(String slug);
    List<Institution> findByStatusAndActiveIsTrueOrderByCreatedAtDesc(InstitutionStatus status);
    List<Institution> findByStatusOrderByCreatedAtAsc(InstitutionStatus status);
}
