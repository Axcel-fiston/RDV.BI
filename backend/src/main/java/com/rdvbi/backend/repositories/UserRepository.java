package com.rdvbi.backend.repositories;

import com.rdvbi.backend.entities.User;
import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByInstitutionOrderByFullNameAsc(Institution institution);
    Optional<User> findByIdAndInstitution(UUID id, Institution institution);
    Optional<User> findFirstByInstitutionAndRoleOrderByCreatedAtAsc(Institution institution, UserRole role);
}
