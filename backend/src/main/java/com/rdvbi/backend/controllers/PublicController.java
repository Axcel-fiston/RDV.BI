package com.rdvbi.backend.controllers;

import com.rdvbi.backend.dto.AppointmentOtpVerificationRequest;
import com.rdvbi.backend.dto.AppointmentRequest;
import com.rdvbi.backend.dto.AppointmentResponse;
import com.rdvbi.backend.dto.InstitutionRegistrationRequest;
import com.rdvbi.backend.entities.Appointment;
import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.entities.ServiceEntity;
import com.rdvbi.backend.entities.TimeSlot;
import com.rdvbi.backend.entities.User;
import com.rdvbi.backend.enums.InstitutionStatus;
import com.rdvbi.backend.repositories.AppointmentRepository;
import com.rdvbi.backend.repositories.CounterRepository;
import com.rdvbi.backend.repositories.InstitutionRepository;
import com.rdvbi.backend.repositories.ServiceRepository;
import com.rdvbi.backend.repositories.TimeSlotRepository;
import com.rdvbi.backend.repositories.UserRepository;
import com.rdvbi.backend.services.BookingService;
import com.rdvbi.backend.services.OtpService;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import com.rdvbi.backend.enums.UserRole;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final InstitutionRepository institutionRepository;
    private final ServiceRepository serviceRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final CounterRepository counterRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final BookingService bookingService;
    private final OtpService otpService;

    public PublicController(InstitutionRepository institutionRepository,
                            ServiceRepository serviceRepository,
                            TimeSlotRepository timeSlotRepository,
                            CounterRepository counterRepository,
                            UserRepository userRepository,
                            AppointmentRepository appointmentRepository,
                            PasswordEncoder passwordEncoder,
                            BookingService bookingService,
                            OtpService otpService) {
        this.institutionRepository = institutionRepository;
        this.serviceRepository = serviceRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.counterRepository = counterRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.bookingService = bookingService;
        this.otpService = otpService;
    }

    @PostMapping("/institutions/register")
    @Transactional
    public ResponseEntity<?> registerInstitution(@Valid @RequestBody InstitutionRegistrationRequest request) {
        String slug = request.slug().toLowerCase(Locale.ROOT);
        if (institutionRepository.findBySlug(slug).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "Slug already exists"));
        }
        String normalizedAdminEmail = request.adminEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmail(normalizedAdminEmail).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "Admin email already exists"));
        }
        Institution institution = Institution.builder()
                .name(request.name())
                .slug(slug)
                .type(request.type())
                .contactEmail(request.contactEmail())
                .contactPhone(request.contactPhone())
                .address(request.address())
                .description(request.description())
                .logoUrl(request.logoUrl())
                .locationLat(request.locationLat())
                .locationLng(request.locationLng())
                .status(InstitutionStatus.PENDING)
                .active(true)
                .build();
        Institution saved = institutionRepository.save(institution);

        User adminUser = User.builder()
                .email(normalizedAdminEmail)
                .passwordHash(passwordEncoder.encode(request.adminPassword()))
                .fullName(request.adminFullName().trim())
                .role(UserRole.ADMIN)
                .institution(saved)
                .active(true)
                .build();
        userRepository.save(adminUser);

        return ResponseEntity.created(URI.create("/api/public/institutions/" + saved.getSlug()))
                .body(Map.of(
                        "id", saved.getId(),
                        "status", saved.getStatus(),
                        "adminEmail", adminUser.getEmail()
                ));
    }

    @GetMapping("/institutions")
    public List<Institution> listApprovedInstitutions() {
        return institutionRepository.findByStatusAndActiveIsTrueOrderByCreatedAtDesc(InstitutionStatus.APPROVED).stream()
                .filter(this::isBookingReady)
                .toList();
    }

    @GetMapping("/institutions/{slug}")
    public ResponseEntity<?> institutionBySlug(@PathVariable String slug, @RequestParam(name = "date", required = false) String date) {
        return institutionRepository.findBySlug(slug.toLowerCase(Locale.ROOT))
                .filter(inst -> inst.getStatus() == InstitutionStatus.APPROVED && Boolean.TRUE.equals(inst.getActive()))
                .filter(this::isBookingReady)
                .map(inst -> buildInstitutionPayload(inst, date))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    private ResponseEntity<Map<String, Object>> buildInstitutionPayload(Institution inst, String date) {
        List<ServiceEntity> services = serviceRepository.findByInstitutionAndActiveIsTrueOrderByName(inst);
        List<TimeSlot> slots;
        if (date != null) {
            slots = timeSlotRepository.findByInstitutionAndDateOrderByStartTimeAsc(inst, LocalDate.parse(date));
        } else {
            slots = timeSlotRepository.findByInstitutionOrderByDateAscStartTimeAsc(inst);
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("institution", inst);
        payload.put("services", services);
        payload.put("timeSlots", slots);
        return ResponseEntity.ok(payload);
    }

    private boolean isBookingReady(Institution institution) {
        boolean hasServices = !serviceRepository.findByInstitutionAndActiveIsTrueOrderByName(institution).isEmpty();
        boolean hasCounters = !counterRepository.findByInstitutionOrderByNumberAsc(institution).isEmpty();
        boolean hasFutureSlots = !timeSlotRepository.findByInstitutionOrderByDateAscStartTimeAsc(institution).stream()
                .filter(slot -> slot.getDate() != null && !slot.getDate().isBefore(LocalDate.now()))
                .toList()
                .isEmpty();
        return hasServices && hasCounters && hasFutureSlots;
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        Appointment saved = bookingService.createAppointment(request);
        return ResponseEntity.status(201).body(Map.of("id", saved.getId(), "status", saved.getStatus()));
    }

    @PostMapping("/appointments/{id}/verify-otp")
    public ResponseEntity<?> verifyAppointmentOtp(@PathVariable UUID id,
                                                  @Valid @RequestBody AppointmentOtpVerificationRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        Appointment verified = otpService.verifyOtp(appointment, request.customerPhone(), request.code());
        return ResponseEntity.ok(AppointmentResponse.from(verified));
    }
}
