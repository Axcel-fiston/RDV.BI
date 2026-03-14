package com.rdvbi.backend.repositories;

import com.rdvbi.backend.entities.Appointment;
import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByInstitutionOrderByAppointmentDateDesc(Institution institution);
    List<Appointment> findByInstitutionAndAppointmentDate(Institution institution, LocalDate date);
    List<Appointment> findByInstitutionAndStatus(Institution institution, AppointmentStatus status);
    List<Appointment> findByCustomerPhoneOrderByAppointmentDateDesc(String customerPhone);
    List<Appointment> findByInstitutionAndAppointmentDateOrderByAppointmentTimeAsc(Institution institution, LocalDate date);
}
