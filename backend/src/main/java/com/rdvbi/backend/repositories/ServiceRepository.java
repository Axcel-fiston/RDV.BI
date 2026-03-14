package com.rdvbi.backend.repositories;

import com.rdvbi.backend.entities.ServiceEntity;
import com.rdvbi.backend.entities.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceRepository extends JpaRepository<ServiceEntity, UUID> {
    List<ServiceEntity> findByInstitutionAndActiveIsTrueOrderByName(Institution institution);
    List<ServiceEntity> findByInstitutionOrderByName(Institution institution);
}
