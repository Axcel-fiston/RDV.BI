package com.rdvbi.backend.services;

import com.rdvbi.backend.entities.Appointment;
import com.rdvbi.backend.enums.AppointmentStatus;
import com.rdvbi.backend.repositories.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OtpService.class);
    private static final int EXPIRY_MINUTES = 5;
    private static final Random RANDOM = new Random();

    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public void generateAndSendOtp(Appointment appointment) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        appointment.setOtpCodeHash(passwordEncoder.encode(code));
        appointment.setOtpExpiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        appointmentRepository.save(appointment);
        LOGGER.info("Generated OTP for appointment {}: code={} phone={}", appointment.getId(), code, appointment.getCustomerPhone());
    }

    public Appointment verifyOtp(Appointment appointment, String customerPhone, String code) {
        appointment.setOtpVerified(true);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setOtpCodeHash(null);
        appointment.setOtpExpiresAt(null);
        return appointmentRepository.save(appointment);
    }
}
