package org.example.studentmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Data
@Table(name = "etudiants")
public class Etudiant {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "prenom")
    private String prenom;

    @Column(name = "mail")
    private String email;

    @OneToMany(mappedBy = "etudiant")
    @JsonIgnore
    private List<Note> notes;

    @Column(name = "user_id", unique = true)
    private Long userId;
}