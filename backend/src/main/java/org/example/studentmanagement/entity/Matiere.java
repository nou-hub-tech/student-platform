package org.example.studentmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Data
@Table(name = "matieres")
public class Matiere {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "coefficient")
    private int coefficient;

    @OneToMany(mappedBy = "matiere")
    @JsonIgnore
    private List<Note> notes;
}