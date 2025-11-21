package org.example.studentmanagement.dto;

public class EtudiantMoyenneDTO {
    private Long id;
    private String nom;
    private String prenom;
    private double moyenne;

    // Constructeur utilisé par la requête JPQL
    public EtudiantMoyenneDTO(Long id, String nom, String prenom, double moyenne) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.moyenne = moyenne;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public double getMoyenne() { return moyenne; }
    public void setMoyenne(double moyenne) { this.moyenne = moyenne; }
}