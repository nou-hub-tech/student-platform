package org.example.studentmanagement.controller;

import org.example.studentmanagement.entity.Etudiant;
import org.example.studentmanagement.service.EtudiantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/etudiants")
@CrossOrigin(origins = "*")
public class EtudiantController {
    private final EtudiantService etudiantService;

    @Autowired
    public EtudiantController(EtudiantService etudiantService) {
        this.etudiantService = etudiantService;
    }

    @GetMapping
    public ResponseEntity<List<Etudiant>> getAllEtudiants() {
        List<Etudiant> etudiants = etudiantService.getAllEtudiants();
        return ResponseEntity.ok(etudiants);
    }

    @GetMapping("/me")
    public ResponseEntity<Etudiant> getOwnResults() {
        // For now, return a sample student (in real app, get from token)
        Etudiant sampleStudent = new Etudiant();
        sampleStudent.setId(1L);
        sampleStudent.setNom("Sample");
        sampleStudent.setPrenom("Student");
        sampleStudent.setEmail("sample@example.com");
        return ResponseEntity.ok(sampleStudent);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Etudiant> getEtudiantByUserId(@PathVariable Long userId) {
        return etudiantService.getEtudiantByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Etudiant> getEtudiantById(@PathVariable Long id) {
        return etudiantService.getEtudiantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Etudiant> createEtudiant(@RequestBody @Valid Etudiant etudiant) {
        Etudiant savedEtudiant = etudiantService.createEtudiant(etudiant);
        return ResponseEntity.status(201).body(savedEtudiant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Etudiant> updateEtudiant(@PathVariable Long id, @RequestBody @Valid Etudiant etudiant) {
        try {
            Etudiant updatedEtudiant = etudiantService.updateEtudiant(id, etudiant);
            return ResponseEntity.ok(updatedEtudiant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEtudiant(@PathVariable Long id) {
        try {
            etudiantService.deleteEtudiant(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}