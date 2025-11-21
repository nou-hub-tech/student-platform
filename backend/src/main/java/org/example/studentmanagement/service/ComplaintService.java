package org.example.studentmanagement.service;

import org.example.studentmanagement.entity.Complaint;
import org.example.studentmanagement.entity.Etudiant;
import org.example.studentmanagement.entity.Note;
import org.example.studentmanagement.entity.Matiere;
import org.example.studentmanagement.repository.ComplaintRepository;
import org.example.studentmanagement.repository.EtudiantRepository;
import org.example.studentmanagement.repository.NoteRepository;
import org.example.studentmanagement.repository.MatiereRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private EtudiantRepository etudiantRepository;
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private MatiereRepository matiereRepository;

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    public List<Complaint> getComplaintsByStudentId(Long etudiantId) {
        return complaintRepository.findByEtudiantIdOrderByCreatedAtDesc(etudiantId);
    }

    public List<Complaint> getComplaintsByStatus(String status) {
        return complaintRepository.findByStatus(status);
    }

    public Complaint createComplaint(Complaint complaint) {
        // Validate student exists
        Etudiant etudiant = etudiantRepository.findById(complaint.getEtudiant().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        complaint.setEtudiant(etudiant);
        
        // Set optional relationships if provided
        if (complaint.getNote() != null && complaint.getNote().getId() != null) {
            Note note = noteRepository.findById(complaint.getNote().getId())
                    .orElseThrow(() -> new RuntimeException("Grade not found"));
            complaint.setNote(note);
        }
        
        if (complaint.getMatiere() != null && complaint.getMatiere().getId() != null) {
            Matiere matiere = matiereRepository.findById(complaint.getMatiere().getId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            complaint.setMatiere(matiere);
        }
        
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        
        return complaintRepository.save(complaint);
    }

    public Complaint updateComplaint(Long id, Complaint complaintDetails) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        complaint.setTitle(complaintDetails.getTitle());
        complaint.setDescription(complaintDetails.getDescription());
        complaint.setStatus(complaintDetails.getStatus());
        complaint.setAdminResponse(complaintDetails.getAdminResponse());
        complaint.setUpdatedAt(LocalDateTime.now());
        
        return complaintRepository.save(complaint);
    }

    public void deleteComplaint(Long id) {
        complaintRepository.deleteById(id);
    }
}
