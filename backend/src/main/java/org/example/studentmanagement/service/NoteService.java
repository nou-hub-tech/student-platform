package org.example.studentmanagement.service;

import jakarta.mail.internet.MimeMessage;
import org.example.studentmanagement.dto.EtudiantMoyenneDTO;
import org.example.studentmanagement.entity.Etudiant;
import org.example.studentmanagement.entity.Matiere;
import org.example.studentmanagement.entity.Note;
import org.example.studentmanagement.repository.EtudiantRepository;
import org.example.studentmanagement.repository.MatiereRepository;
import org.example.studentmanagement.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Service
public class NoteService {
    @Autowired
    private NoteRepository noteRepository;
    @Autowired
    private EtudiantRepository etudiantRepository;
    @Autowired
    private MatiereRepository matiereRepository;

    private final JavaMailSender mailSender;

    @Autowired
    public NoteService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }


    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    public List<Note> getNotesByEtudiantId(Long etudiantId) {
        return noteRepository.findByEtudiantId(etudiantId);
    }

    public Note createNote(Note note) {
        Etudiant etudiant = etudiantRepository.findById(note.getEtudiant().getId())
                .orElseThrow(() -> new RuntimeException("Etudiant not found"));
        Matiere matiere = matiereRepository.findById(note.getMatiere().getId())
                .orElseThrow(() -> new RuntimeException("Matiere not found"));
        note.setEtudiant(etudiant);
        note.setMatiere(matiere);
        Note noteSaved = noteRepository.save(note);
        sendEmailNotification(noteSaved);

        return noteSaved;
    }

    private void sendEmailNotification(Note grade) {
        Etudiant student = grade.getEtudiant();
        Matiere subject = grade.getMatiere();

        if (student != null && student.getEmail() != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
                helper.setFrom("nouha.blidi544@gmail.com");
                helper.setTo(student.getEmail());
                helper.setSubject("New Grade Published");

                String emailContent = String.format("""
                        <html><body>
                        <h2>📢 New Grade Available</h2>
                        <p>Hello <strong>%s %s</strong>,</p>
                        <p>Your grade for <strong>%s</strong> has been published.</p>
                        <p><strong>Grade:</strong> <span style="color: green; font-size: 16px;">%s</span></p>
                        <p>Log in to the student portal to view all your results.</p>
                        <p><em>This is an automated message.</em></p>
                        </body></html>
                        """, student.getPrenom(), student.getNom(), subject.getNom(), grade.getValeur());

                helper.setText(emailContent, true);
                mailSender.send(message);
            } catch (Exception e) {
                System.out.println("Error sending email: " + e.getMessage());
            }
        }
    }



    public Note updateNote(Long id, Note noteDetails) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        note.setValeur(noteDetails.getValeur());
        if (noteDetails.getEtudiant() != null) {
            Etudiant etudiant = etudiantRepository.findById(noteDetails.getEtudiant().getId())
                    .orElseThrow(() -> new RuntimeException("Etudiant not found"));
            note.setEtudiant(etudiant);
        }
        if (noteDetails.getMatiere() != null) {
            Matiere matiere = matiereRepository.findById(noteDetails.getMatiere().getId())
                    .orElseThrow(() -> new RuntimeException("Matiere not found"));
            note.setMatiere(matiere);
        }
        return noteRepository.save(note);
    }

    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    public List<EtudiantMoyenneDTO> getAllEtudiantsWithMoyenne() {
        return noteRepository.findAllEtudiantsWithMoyenne();
    }
}