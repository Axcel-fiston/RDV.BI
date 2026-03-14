package com.rdvbi.backend.dto;

import com.rdvbi.backend.entities.Appointment;
import com.rdvbi.backend.enums.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID institutionId,
        UUID serviceId,
        UUID timeSlotId,
        String ticketNumber,
        String customerPhone,
        String customerEmail,
        String customerName,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        AppointmentStatus status,
        Boolean otpVerified,
        String counterNumber,
        LocalDateTime calledTime,
        LocalDateTime completedTime
) {
    public static AppointmentResponse from(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getInstitution() != null ? appointment.getInstitution().getId() : null,
                appointment.getService() != null ? appointment.getService().getId() : null,
                appointment.getTimeSlot() != null ? appointment.getTimeSlot().getId() : null,
                appointment.getTicketNumber(),
                appointment.getCustomerPhone(),
                appointment.getCustomerEmail(),
                appointment.getCustomerName(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getStatus(),
                appointment.getOtpVerified(),
                appointment.getCounterNumber(),
                appointment.getCalledTime(),
                appointment.getCompletedTime()
        );
    }
}
