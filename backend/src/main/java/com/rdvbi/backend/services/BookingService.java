package com.rdvbi.backend.services;

import com.rdvbi.backend.dto.AppointmentRequest;
import com.rdvbi.backend.entities.Appointment;
import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.entities.ServiceEntity;
import com.rdvbi.backend.entities.TimeSlot;
import com.rdvbi.backend.enums.AppointmentStatus;
import com.rdvbi.backend.enums.InstitutionStatus;
import com.rdvbi.backend.repositories.AppointmentRepository;
import com.rdvbi.backend.repositories.InstitutionRepository;
import com.rdvbi.backend.repositories.ServiceRepository;
import com.rdvbi.backend.repositories.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final InstitutionRepository institutionRepository;
    private final ServiceRepository serviceRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final AppointmentRepository appointmentRepository;
    private final OtpService otpService;

    @Transactional
    public Appointment createAppointment(AppointmentRequest request) {
        rejectIfPastDate(request.appointmentDate());

        Institution institution = institutionRepository.findById(request.institutionId())
                .filter(i -> i.getStatus() == InstitutionStatus.APPROVED && Boolean.TRUE.equals(i.getActive()))
                .orElseThrow(() -> badRequest("Institution not approved"));

        ServiceEntity service = serviceRepository.findById(request.serviceId())
                .orElseThrow(() -> badRequest("Service not found"));
        if (!service.getInstitution().getId().equals(institution.getId())) {
            throw badRequest("Service does not belong to institution");
        }

        TimeSlot timeSlot = lockedSlot(request.timeSlotId());
        validateSlotOwnership(timeSlot, institution);
        validateSlotDateAndTime(timeSlot, request.appointmentDate(), request.appointmentTime());
        if (Boolean.TRUE.equals(timeSlot.getBlocked())) {
            throw conflict("Time slot is blocked");
        }
        if (timeSlot.getBookedCount() >= timeSlot.getCapacity()) {
            throw conflict("Time slot is full");
        }
        timeSlot.setBookedCount(timeSlot.getBookedCount() + 1);
        timeSlotRepository.save(timeSlot);

        Appointment appointment = Appointment.builder()
                .institution(institution)
                .service(service)
                .timeSlot(timeSlot)
                .customerPhone(request.customerPhone())
                .customerEmail(request.customerEmail())
                .customerName(request.customerName())
                .appointmentDate(request.appointmentDate())
                .appointmentTime(request.appointmentTime())
                .ticketNumber(request.ticketNumber())
                .status(AppointmentStatus.PENDING)
                .otpVerified(false)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        otpService.generateAndSendOtp(saved);
        return saved;
    }

    private void rejectIfPastDate(LocalDate appointmentDate) {
        if (appointmentDate.isBefore(LocalDate.now())) {
            throw badRequest("Appointment date cannot be in the past");
        }
    }

    private TimeSlot lockedSlot(java.util.UUID slotId) {
        return timeSlotRepository.findWithLockingById(slotId)
                .orElseThrow(() -> badRequest("Time slot not found"));
    }

    private void validateSlotOwnership(TimeSlot slot, Institution institution) {
        if (!slot.getInstitution().getId().equals(institution.getId())) {
            throw badRequest("Time slot does not belong to institution");
        }
    }

    private void validateSlotDateAndTime(TimeSlot slot, LocalDate requestedDate, LocalTime requestedTime) {
        if (!slot.getDate().equals(requestedDate)) {
            throw badRequest("Appointment date must match time slot date");
        }
        if (requestedTime != null) {
            boolean beforeStart = requestedTime.isBefore(slot.getStartTime());
            boolean afterEnd = requestedTime.isAfter(slot.getEndTime()) || requestedTime.equals(slot.getEndTime());
            if (beforeStart || afterEnd) {
                throw badRequest("Appointment time must fall inside the time slot window");
            }
        }
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
