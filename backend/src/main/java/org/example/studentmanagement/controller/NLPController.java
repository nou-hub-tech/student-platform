package org.example.studentmanagement.controller;

import org.example.studentmanagement.dto.NLPRequest;
import org.example.studentmanagement.dto.NLPResponse;
import org.example.studentmanagement.entity.Etudiant;
import org.example.studentmanagement.service.NLPService;
import org.example.studentmanagement.service.EtudiantService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/nlp")
@CrossOrigin(origins = "*")
public class NLPController {

    private static final Logger logger = LoggerFactory.getLogger(NLPController.class);

    @Autowired
    private NLPService nlpService;

    @Autowired
    private EtudiantService etudiantService;



    /**
     Main endpoint for getting answers to both personal and general questions

     **/
    @PostMapping(value = "/answer/{etudiantId}",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getAnswer(@RequestBody(required = false) NLPRequest request,
                                            @PathVariable Long etudiantId) {
        try {
            // Validate request
            if (request == null || request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
                return ResponseEntity.ok("Please provide a question.");
            }

            String question = request.getQuestion().trim();
            logger.info("Processing question for student {}: {}", etudiantId, question);

            // Get student information (for personal questions)
            Etudiant student = null;

            // Try to get student by ID
            student = etudiantService.getEtudiantById(etudiantId).orElse(null);

            // Fallback to first student if specific student not found
            if (student == null) {
                logger.warn("Student with ID {} not found, trying fallback", etudiantId);
                student = etudiantService.getAllEtudiants().stream().findFirst().orElse(null);
            }

            // If still no student found, return appropriate message
            if (student == null) {
                logger.warn("No student profile found");
                // For general questions, we might still be able to answer
                // Check if it's likely a general question
                if (isLikelyGeneralQuestion(question)) {
                    logger.info("Attempting to answer as general question without student context");
                    String answer = nlpService.getAnswer(question, null);
                    return ResponseEntity.ok(answer);
                } else {
                    return ResponseEntity.ok("I'm sorry, I couldn't find any student profile. " +
                            "Please add a student record first for personal questions, " +
                            "or ask general questions about the university.");
                }
            }

            // Get answer from NLP service (handles both personal and general questions)
            String answer = nlpService.getAnswer(question, student);
            logger.info("Answer generated successfully");
            return ResponseEntity.ok(answer);

        } catch (Exception e) {
            logger.error("Error processing question: ", e);
            return ResponseEntity.ok("Sorry, I encountered an error while processing your request. Please try again.");
        }
    }

    /**
     * Helper method to quickly check if question is likely general
     * This is a simplified check for the controller level
     */
    private boolean isLikelyGeneralQuestion(String question) {
        String lowerQuestion = question.toLowerCase();
        return (lowerQuestion.contains("what is") ||
                lowerQuestion.contains("explain") ||
                lowerQuestion.contains("how does") ||
                lowerQuestion.contains("university") ||
                lowerQuestion.contains("policy") ||
                lowerQuestion.contains("admission") ||
                lowerQuestion.contains("scholarship")) &&
                !lowerQuestion.contains("my") &&
                !lowerQuestion.contains("i ");
    }

    /**
      Health check endpoint for the NLP service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("NLP Service is running");
    }


}