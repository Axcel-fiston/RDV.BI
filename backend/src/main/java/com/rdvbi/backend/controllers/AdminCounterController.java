package com.rdvbi.backend.controllers;

import com.rdvbi.backend.dto.CounterRequest;
import com.rdvbi.backend.dto.CounterUpdateRequest;
import com.rdvbi.backend.entities.Counter;
import com.rdvbi.backend.repositories.CounterRepository;
import com.rdvbi.backend.repositories.InstitutionRepository;
import com.rdvbi.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCounterController {

    private final CounterRepository counterRepository;
    private final InstitutionRepository institutionRepository;

    @GetMapping("/institutions/{institutionId}/counters")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> list(@AuthenticationPrincipal CustomUserDetails principal,
                                  @PathVariable("institutionId") UUID institutionId) {
        if (!principal.user().getInstitution().getId().equals(institutionId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
        }
        return institutionRepository.findById(institutionId)
                .<ResponseEntity<?>>map(inst -> ResponseEntity.ok(counterRepository.findByInstitutionOrderByNumberAsc(inst)))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @PostMapping("/institutions/{institutionId}/counters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@AuthenticationPrincipal CustomUserDetails principal,
                                    @PathVariable("institutionId") UUID institutionId,
                                    @Valid @RequestBody CounterRequest request) {
        if (!principal.user().getInstitution().getId().equals(institutionId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
        }
        return institutionRepository.findById(institutionId)
                .<ResponseEntity<?>>map(inst -> {
                    Counter counter = Counter.builder()
                            .institution(inst)
                            .number(request.number())
                            .staffName(request.staffName())
                            .active(request.active() == null ? true : request.active())
                            .build();
                    Counter saved = counterRepository.save(counter);
                    return ResponseEntity.status(201).body(saved);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Institution not found")));
    }

    @PutMapping("/counters/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@AuthenticationPrincipal CustomUserDetails principal,
                                    @PathVariable("id") UUID id,
                                    @RequestBody CounterUpdateRequest request) {
        return counterRepository.findById(id)
                .<ResponseEntity<?>>map(counter -> {
                    if (!counter.getInstitution().getId().equals(principal.user().getInstitution().getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
                    }
                    if (request.number() != null) counter.setNumber(request.number());
                    if (request.staffName() != null) counter.setStaffName(request.staffName());
                    if (request.active() != null) counter.setActive(request.active());
                    if (request.status() != null) counter.setStatus(request.status());
                    if (request.currentTicket() != null || request.status() != null) {
                        counter.setCurrentTicket(request.currentTicket());
                    }
                    return ResponseEntity.ok(counterRepository.save(counter));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Counter not found")));
    }

    @DeleteMapping("/counters/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@AuthenticationPrincipal CustomUserDetails principal,
                                    @PathVariable("id") UUID id) {
        return counterRepository.findById(id)
                .<ResponseEntity<?>>map(counter -> {
                    if (!counter.getInstitution().getId().equals(principal.user().getInstitution().getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Institution access denied"));
                    }
                    counterRepository.delete(counter);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Counter not found")));
    }
}
