package com.rdvbi.backend.controllers;

import com.rdvbi.backend.dto.ApprovalRequest;
import com.rdvbi.backend.dto.InstitutionReviewResponse;
import com.rdvbi.backend.dto.InstitutionUpdateRequest;
import com.rdvbi.backend.dto.ServiceUpdateRequest;
import com.rdvbi.backend.dto.ServiceRequest;
import com.rdvbi.backend.dto.TimeSlotRequest;
import com.rdvbi.backend.dto.TimeSlotUpdateRequest;
import com.rdvbi.backend.entities.Institution;
import com.rdvbi.backend.entities.ServiceEntity;
import com.rdvbi.backend.entities.TimeSlot;
import com.rdvbi.backend.entities.User;
import com.rdvbi.backend.enums.InstitutionStatus;
import com.rdvbi.backend.enums.UserRole;
import com.rdvbi.backend.repositories.InstitutionRepository;
import com.rdvbi.backend.repositories.ServiceRepository;
import com.rdvbi.backend.repositories.TimeSlotRepository;
import com.rdvbi.backend.repositories.UserRepository;
import com.rdvbi.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final InstitutionRepository institutionRepository;
    private final ServiceRepository serviceRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;

    public AdminController(InstitutionRepository institutionRepository,
                           ServiceRepository serviceRepository,
                           TimeSlotRepository timeSlotRepository,
                           UserRepository userRepository) {
        this.institutionRepository = institutionRepository;
        this.serviceRepository = serviceRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/institutions/pending")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public List<InstitutionReviewResponse> pendingInstitutions() {
        return institutionRepository.findByStatusOrderByCreatedAtAsc(InstitutionStatus.PENDING).stream()
                .map(this::toReviewResponse)
                .toList();
    }

    @GetMapping("/institutions")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public List<InstitutionReviewResponse> listInstitutions(@RequestParam(name = "status", required = false) InstitutionStatus status) {
        java.util.List<Institution> institutions = status == null
                ? institutionRepository.findAll()
                : institutionRepository.findByStatusOrderByCreatedAtAsc(status);
        return institutions.stream()
                .sorted(java.util.Comparator.comparing(Institution::getCreatedAt).reversed())
                .map(this::toReviewResponse)
                .toList();
    }

    @PostMapping("/institutions/{id}/approve")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<?> approve(@PathVariable("id") UUID id, @RequestBody(required = false) ApprovalRequest body) {
        return institutionRepository.findById(id)
                .<ResponseEntity<?>>map(inst -> {
                    inst.setStatus(InstitutionStatus.APPROVED);
                    inst.setApprovalNotes(body != null ? body.notes() : null);
                    inst.setApprovedAt(java.time.LocalDateTime.now());
                    inst.setRejectedAt(null);
                    institutionRepository.save(inst);
                    return ResponseEntity.ok().body(inst);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @PostMapping("/institutions/{id}/reject")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<?> reject(@PathVariable("id") UUID id, @RequestBody(required = false) ApprovalRequest body) {
        return institutionRepository.findById(id)
                .<ResponseEntity<?>>map(inst -> {
                    inst.setStatus(InstitutionStatus.REJECTED);
                    inst.setApprovalNotes(body != null ? body.notes() : null);
                    inst.setRejectedAt(java.time.LocalDateTime.now());
                    institutionRepository.save(inst);
                    return ResponseEntity.ok().body(inst);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @PutMapping("/institutions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateInstitution(@AuthenticationPrincipal CustomUserDetails principal,
                                               @PathVariable("id") UUID id,
                                               @RequestBody InstitutionUpdateRequest request) {
        if (!principal.user().getInstitution().getId().equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
        }
        return institutionRepository.findById(id)
                .<ResponseEntity<?>>map(inst -> {
                    if (request.name() != null) inst.setName(request.name());
                    if (request.slug() != null) inst.setSlug(request.slug().toLowerCase());
                    if (request.type() != null) inst.setType(request.type());
                    if (request.address() != null) inst.setAddress(request.address());
                    if (request.contactPhone() != null) inst.setContactPhone(request.contactPhone());
                    if (request.contactEmail() != null) inst.setContactEmail(request.contactEmail());
                    if (request.logoUrl() != null) inst.setLogoUrl(request.logoUrl());
                    if (request.active() != null) inst.setActive(request.active());
                    Institution saved = institutionRepository.save(inst);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @PostMapping("/institutions/{id}/services")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addService(@AuthenticationPrincipal CustomUserDetails principal,
                                        @PathVariable("id") UUID id,
                                        @Valid @RequestBody ServiceRequest request) {
        if (!principal.user().getInstitution().getId().equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
        }
        return institutionRepository.findById(id)
                .<ResponseEntity<?>>map(inst -> {
                    Integer duration = request.durationMinutes() != null ? request.durationMinutes() : 30;
                    ServiceEntity service = ServiceEntity.builder()
                            .institution(inst)
                            .name(request.name())
                            .description(request.description())
                            .durationMinutes(duration)
                            .prefix(request.prefix())
                            .active(request.active() == null ? true : request.active())
                            .build();
                    ServiceEntity saved = serviceRepository.save(service);
                    return ResponseEntity.status(201).body(saved);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @GetMapping("/institutions/{id}/services")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> listServices(@AuthenticationPrincipal CustomUserDetails principal,
                                          @PathVariable("id") UUID id) {
        if (!principal.user().getInstitution().getId().equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
        }
        return institutionRepository.findById(id)
                .<ResponseEntity<?>>map(inst -> ResponseEntity.ok(serviceRepository.findByInstitutionOrderByName(inst)))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @PutMapping("/services/{serviceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateService(@AuthenticationPrincipal CustomUserDetails principal,
                                           @PathVariable("serviceId") UUID serviceId,
                                           @RequestBody ServiceUpdateRequest request) {
        return serviceRepository.findById(serviceId)
                .<ResponseEntity<?>>map(service -> {
                    if (!service.getInstitution().getId().equals(principal.user().getInstitution().getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
                    }
                    if (request.name() != null) service.setName(request.name());
                    if (request.description() != null) service.setDescription(request.description());
                    if (request.durationMinutes() != null) service.setDurationMinutes(request.durationMinutes());
                    if (request.prefix() != null) service.setPrefix(request.prefix());
                    if (request.active() != null) service.setActive(request.active());
                    ServiceEntity saved = serviceRepository.save(service);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Service not found")));
    }

    @DeleteMapping("/services/{serviceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteService(@AuthenticationPrincipal CustomUserDetails principal,
                                           @PathVariable("serviceId") UUID serviceId) {
        return serviceRepository.findById(serviceId)
                .<ResponseEntity<?>>map(service -> {
                    if (!service.getInstitution().getId().equals(principal.user().getInstitution().getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
                    }
                    serviceRepository.delete(service);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Service not found")));
    }

    @GetMapping("/institutions/{id}/time-slots")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> listTimeSlots(@AuthenticationPrincipal CustomUserDetails principal,
                                           @PathVariable("id") UUID id,
                                           @RequestParam(name = "date", required = false) String date) {
        if (!principal.user().getInstitution().getId().equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
        }
        return institutionRepository.findById(id)
                .<ResponseEntity<?>>map(inst -> {
                    if (date != null) {
                        LocalDate parsed = LocalDate.parse(date);
                        return ResponseEntity.ok(timeSlotRepository.findByInstitutionAndDateOrderByStartTimeAsc(inst, parsed));
                    }
                    return ResponseEntity.ok(timeSlotRepository.findByInstitutionOrderByDateAscStartTimeAsc(inst));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @PostMapping("/institutions/{id}/time-slots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addTimeSlots(@AuthenticationPrincipal CustomUserDetails principal,
                                          @PathVariable("id") UUID id,
                                          @Valid @RequestBody List<TimeSlotRequest> requests) {
        if (!principal.user().getInstitution().getId().equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
        }
        return institutionRepository.findById(id)
                .map(inst -> {
                    String validationError = validateTimeSlots(inst, requests);
                    if (validationError != null) {
                        return ResponseEntity.badRequest().body(Map.of("error", validationError));
                    }
                    List<TimeSlot> slots = requests.stream()
                            .map(req -> TimeSlot.builder()
                                    .institution(inst)
                                    .date(req.date())
                                    .startTime(req.startTime())
                                    .endTime(req.endTime())
                                    .capacity(req.capacity() != null ? req.capacity() : 1)
                                    .bookedCount(0)
                                    .build())
                            .toList();
                    return ResponseEntity.status(201).body(timeSlotRepository.saveAll(slots));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @PutMapping("/time-slots/{slotId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTimeSlot(@AuthenticationPrincipal CustomUserDetails principal,
                                            @PathVariable("slotId") UUID slotId,
                                            @RequestBody TimeSlotUpdateRequest request) {
        return timeSlotRepository.findById(slotId)
                .<ResponseEntity<?>>map(slot -> {
                    if (!slot.getInstitution().getId().equals(principal.user().getInstitution().getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
                    }
                    if (request.date() != null) slot.setDate(request.date());
                    if (request.startTime() != null) slot.setStartTime(request.startTime());
                    if (request.endTime() != null) slot.setEndTime(request.endTime());
                    if (request.capacity() != null) slot.setCapacity(request.capacity());
                    if (request.blocked() != null) slot.setBlocked(request.blocked());
                    if (request.blockReason() != null) {
                        slot.setBlockReason(request.blockReason());
                    } else if (Boolean.FALSE.equals(request.blocked())) {
                        slot.setBlockReason(null);
                    }
                    return ResponseEntity.ok(timeSlotRepository.save(slot));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Time slot not found")));
    }

    @DeleteMapping("/time-slots/{slotId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTimeSlot(@AuthenticationPrincipal CustomUserDetails principal,
                                            @PathVariable("slotId") UUID slotId) {
        return timeSlotRepository.findById(slotId)
                .<ResponseEntity<?>>map(slot -> {
                    if (!slot.getInstitution().getId().equals(principal.user().getInstitution().getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
                    }
                    timeSlotRepository.delete(slot);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Time slot not found")));
    }

    private String validateTimeSlots(Institution inst, List<TimeSlotRequest> requests) {
        Map<LocalDate, List<TimeSlot>> perDate = new java.util.HashMap<>();
        for (TimeSlotRequest req : requests) {
            if (!req.endTime().isAfter(req.startTime())) {
                return "endTime must be after startTime";
            }
            List<TimeSlot> existing = perDate.computeIfAbsent(req.date(), d -> loadExistingSlots(inst, d));
            if (overlapsAny(req.startTime(), req.endTime(), existing)) {
                return "Time slot overlaps an existing slot on " + req.date();
            }
            existing.add(TimeSlot.builder()
                    .date(req.date())
                    .startTime(req.startTime())
                    .endTime(req.endTime())
                    .build()); // account for newly added slots in the same request payload
        }
        return null;
    }

    private List<TimeSlot> loadExistingSlots(Institution inst, LocalDate date) {
        return timeSlotRepository.findByInstitutionAndDateOrderByStartTimeAsc(inst, date).stream()
                .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));
    }

    private boolean overlapsAny(LocalTime start, LocalTime end, List<TimeSlot> windows) {
        return windows.stream().anyMatch(w -> overlaps(start, end, w.getStartTime(), w.getEndTime()));
    }

    private boolean overlaps(LocalTime startA, LocalTime endA, LocalTime startB, LocalTime endB) {
        return startA.isBefore(endB) && startB.isBefore(endA);
    }

    private InstitutionReviewResponse toReviewResponse(Institution institution) {
        User admin = userRepository.findFirstByInstitutionAndRoleOrderByCreatedAtAsc(institution, UserRole.ADMIN).orElse(null);
        return InstitutionReviewResponse.builder()
                .id(institution.getId().toString())
                .name(institution.getName())
                .slug(institution.getSlug())
                .type(institution.getType())
                .contactEmail(institution.getContactEmail())
                .contactPhone(institution.getContactPhone())
                .address(institution.getAddress())
                .description(institution.getDescription())
                .logoUrl(institution.getLogoUrl())
                .status(institution.getStatus().name())
                .approvalNotes(institution.getApprovalNotes())
                .createdAt(institution.getCreatedAt() != null ? institution.getCreatedAt().toString() : null)
                .approvedAt(institution.getApprovedAt() != null ? institution.getApprovedAt().toString() : null)
                .rejectedAt(institution.getRejectedAt() != null ? institution.getRejectedAt().toString() : null)
                .adminFullName(admin != null ? admin.getFullName() : null)
                .adminEmail(admin != null ? admin.getEmail() : null)
                .build();
    }
}
