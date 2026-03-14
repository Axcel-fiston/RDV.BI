package com.rdvbi.backend.controllers;

import com.rdvbi.backend.dto.AppointmentUpdateRequest;
import com.rdvbi.backend.dto.AppointmentResponse;
import com.rdvbi.backend.entities.Appointment;
import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.entities.TimeSlot;
import com.rdvbi.backend.repositories.AppointmentRepository;
import com.rdvbi.backend.repositories.TimeSlotRepository;
import com.rdvbi.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/admin/appointments")
@RequiredArgsConstructor
public class AdminAppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> listAppointments(@AuthenticationPrincipal CustomUserDetails principal,
                                              @RequestParam(name = "institutionId", required = false) UUID institutionId,
                                              @RequestParam(name = "appointmentDate", required = false) LocalDate appointmentDate,
                                              @RequestParam(name = "customerPhone", required = false) String customerPhone,
                                              @RequestParam(name = "id", required = false) UUID id) {
        Institution principalInstitution = principal.user().getInstitution();

        if (id != null) {
            return appointmentRepository.findById(id)
                    .<ResponseEntity<?>>map(appointment -> {
                        if (!appointment.getInstitution().getId().equals(principalInstitution.getId())) {
                            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
                        }
                        return ResponseEntity.ok(AppointmentResponse.from(appointment));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Appointment not found")));
        }

        if (customerPhone != null) {
            return ResponseEntity.ok(
                    toResponses(
                            appointmentRepository.findByCustomerPhoneOrderByAppointmentDateDesc(customerPhone).stream()
                                    .filter(appointment -> appointment.getInstitution().getId().equals(principalInstitution.getId()))
                                    .toList()
                    )
            );
        }

        if (institutionId != null && !institutionId.equals(principalInstitution.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
        }

        if (institutionId != null || appointmentDate != null) {
            Institution inst = principalInstitution;
            if (appointmentDate != null) {
                return ResponseEntity.ok(
                        toResponses(appointmentRepository.findByInstitutionAndAppointmentDateOrderByAppointmentTimeAsc(inst, appointmentDate))
                );
            }
            return ResponseEntity.ok(toResponses(appointmentRepository.findByInstitutionOrderByAppointmentDateDesc(inst)));
        }
        return ResponseEntity.ok(toResponses(appointmentRepository.findByInstitutionOrderByAppointmentDateDesc(principalInstitution)));
    }

    private List<AppointmentResponse> toResponses(List<Appointment> appointments) {
        return appointments.stream().map(AppointmentResponse::from).toList();
    }

    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> updateAppointment(@AuthenticationPrincipal CustomUserDetails principal,
                                               @PathVariable("id") UUID id,
                                               @RequestBody AppointmentUpdateRequest request) {
        return appointmentRepository.findById(id)
                .<ResponseEntity<?>>map(apt -> {
                    if (!apt.getInstitution().getId().equals(principal.user().getInstitution().getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
                    }
                    if (request.status() != null) {
                        apt.setStatus(request.status());
                    }
                    if (request.appointmentDate() != null) {
                        apt.setAppointmentDate(request.appointmentDate());
                    }
                    if (request.appointmentTime() != null) {
                        apt.setAppointmentTime(request.appointmentTime());
                    }
                    if (request.ticketNumber() != null) {
                        apt.setTicketNumber(request.ticketNumber());
                    }
                    if (request.customerEmail() != null) {
                        apt.setCustomerEmail(request.customerEmail());
                    }
                    if (request.customerPhone() != null) {
                        apt.setCustomerPhone(request.customerPhone());
                    }
                    if (request.timeSlotId() != null) {
                        TimeSlot newSlot = timeSlotRepository.findWithLockingById(request.timeSlotId())
                                .orElse(null);
                        if (newSlot == null) {
                            return ResponseEntity.status(404).body(Map.of("error", "Time slot not found"));
                        }
                        if (!newSlot.getInstitution().getId().equals(apt.getInstitution().getId())) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Time slot does not belong to the appointment institution"));
                        }
                        if (newSlot.getBookedCount() >= newSlot.getCapacity()) {
                            return ResponseEntity.status(409).body(Map.of("error", "Time slot is full"));
                        }

                        TimeSlot currentSlot = apt.getTimeSlot();
                        if (currentSlot != null && !currentSlot.getId().equals(newSlot.getId())) {
                            currentSlot.setBookedCount(Math.max(0, currentSlot.getBookedCount() - 1));
                            timeSlotRepository.save(currentSlot);
                        }

                        newSlot.setBookedCount(newSlot.getBookedCount() + 1);
                        timeSlotRepository.save(newSlot);
                        apt.setTimeSlot(newSlot);

                        // Keep appointment date/time consistent with slot if not explicitly set
                        if (request.appointmentDate() == null) {
                            apt.setAppointmentDate(newSlot.getDate());
                        }
                        if (request.appointmentTime() == null) {
                            apt.setAppointmentTime(newSlot.getStartTime());
                        }
                    }

                    if (request.counterNumber() != null) {
                        apt.setCounterNumber(request.counterNumber());
                    }
                    if (request.calledTime() != null) {
                        apt.setCalledTime(request.calledTime().toLocalDateTime());
                    }
                    if (request.completedTime() != null) {
                        apt.setCompletedTime(request.completedTime().toLocalDateTime());
                    }

                    Appointment saved = appointmentRepository.save(apt);
                    return ResponseEntity.ok(AppointmentResponse.from(saved));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Appointment not found")));
    }
}
