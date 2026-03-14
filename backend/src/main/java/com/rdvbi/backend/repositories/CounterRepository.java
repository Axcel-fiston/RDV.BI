package com.rdvbi.backend.repositories;

import com.rdvbi.backend.entities.Counter;
import com.rdvbi.backend.entities.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CounterRepository extends JpaRepository<Counter, UUID> {
    List<Counter> findByInstitutionOrderByNumberAsc(Institution institution);
}
