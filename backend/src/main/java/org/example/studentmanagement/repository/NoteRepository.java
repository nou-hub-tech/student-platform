package org.example.studentmanagement.repository;

import org.example.studentmanagement.entity.Note;
import org.example.studentmanagement.dto.EtudiantMoyenneDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByEtudiantId(Long etudiantId);

    @Query("SELECT new org.example.studentmanagement.dto.EtudiantMoyenneDTO(e.id, e.nom, e.prenom, " +
            "CASE WHEN SUM(m.coefficient) > 0 THEN SUM(n.valeur * m.coefficient) / SUM(m.coefficient) ELSE 0.0 END) " +
            "FROM Etudiant e LEFT JOIN e.notes n LEFT JOIN n.matiere m " +
            "GROUP BY e.id, e.nom, e.prenom")
    List<EtudiantMoyenneDTO> findAllEtudiantsWithMoyenne();

}