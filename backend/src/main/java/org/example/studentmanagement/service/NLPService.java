package org.example.studentmanagement.service;

import org.example.studentmanagement.dto.EtudiantMoyenneDTO;
import org.example.studentmanagement.dto.NLPRequest;
import org.example.studentmanagement.dto.NLPResponse;
import org.example.studentmanagement.entity.Etudiant;
import org.example.studentmanagement.entity.Note;
import org.example.studentmanagement.entity.Exam;
import org.example.studentmanagement.entity.Matiere;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
public class NLPService {

    @Autowired
    private NoteService noteService;

    @Autowired
    private ExamService examService;

    @Autowired
    private MatiereService matiereService;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // Keywords for personal questions classification
    private static final List<String> PERSONAL_KEYWORDS = Arrays.asList(
            "my", "mine", "me", "i", "grade", "grades", "average", "score", "scores",
            "exam", "exams", "test", "tests", "subject", "subjects", "course", "courses",
            "highest", "lowest", "best", "worst", "upcoming", "scheduled", "performance",
            "how am i", "what are my", "show my", "tell me my", "do i have"
    );

    // Keywords for general questions classification
    private static final List<String> GENERAL_KEYWORDS = Arrays.asList(
            "what is", "what are", "who is", "who are", "when is", "when are",
            "where is", "where are", "how does", "how do", "why is", "why are",
            "explain", "describe", "definition", "meaning", "university", "campus",
            "policy", "policies", "procedure", "procedures", "admission", "admissions",
            "scholarship", "scholarships", "faculty", "department", "departments",
            "program", "programs", "degree", "degrees", "curriculum", "requirements"
    );

    public NLPService() {
    }

    /**
     * Main method to classify and answer questions
     */
    public String getAnswer(String question, Etudiant student) {
        try {
            // First, classify the question type
            String questionType = classifyQuestion(question);

            if ("personal".equals(questionType)) {
                // Handle personal question - query database
                return handlePersonalQuestion(question, student);
            } else if ("general".equals(questionType)) {
                // Handle general question - query RAG microservice
                return handleGeneralQuestion(question);
            } else {
                // Unknown type - try to determine from NLP service
                return handleUnknownQuestion(question, student);
            }
        } catch (Exception e) {
            return "Sorry, I encountered an error while processing your request: " + e.getMessage();
        }
    }

    /**
     * Classify question as personal or general
     */
    private String classifyQuestion(String question) {
        String lowerQuestion = question.toLowerCase();

        // Count keyword matches
        long personalMatches = PERSONAL_KEYWORDS.stream()
                .filter(keyword -> lowerQuestion.contains(keyword))
                .count();

        long generalMatches = GENERAL_KEYWORDS.stream()
                .filter(keyword -> lowerQuestion.contains(keyword))
                .count();

        // Classify based on keyword matches
        if (personalMatches > generalMatches) {
            return "personal";
        } else if (generalMatches > personalMatches) {
            return "general";
        } else {
            // If equal or no matches, try more sophisticated analysis
            return analyzeQuestionContext(lowerQuestion);
        }
    }

    /**
      context analysis for ambiguous questions
     */
    private String analyzeQuestionContext(String question) {
        // Check for first-person pronouns at the beginning
        if (question.startsWith("my ") || question.startsWith("i ") ||
                question.contains("show me my") || question.contains("tell me my")) {
            return "personal";
        }

        // Check for general question patterns
        if (question.matches("^(what|who|when|where|why|how)\\s+(is|are|does|do).*")) {
            return "general";
        }

        // Default to general for unknown patterns
        return "general";
    }

    /**
     * Handle personal questions by querying the database
     */
    private String handlePersonalQuestion(String question, Etudiant student) {
        try {

            String intent = inferPersonalIntent(question);



            switch (intent.toLowerCase()) {
                case "average":
                    return getStudentAverage(student);

                case "highest_grade":
                    return getHighestGrade(student);

                case "lowest_grade":
                    return getLowestGrade(student);

                case "all_grades":
                    return getAllGrades(student);

                case "subjects":
                    return getStudentSubjects(student);

                case "upcoming_exams":
                    return getUpcomingExams(student);

                default:
                    return "I understand you're asking about your personal information, but I couldn't determine exactly what you need. " +
                            "You can ask about your grades, average, subjects, or upcoming exams.";
            }
        } catch (Exception e) {
            return "Sorry, I couldn't retrieve your personal information: " + e.getMessage();
        }
    }

    /**
     * Handle general questions by querying the RAG microservice
     */
    private String handleGeneralQuestion(String question) {
        try {
            String ragServiceUrl = "http://localhost:8000/ask"; // RAG service URL

            // Create request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("question", question);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create HTTP entity
            HttpEntity<ObjectNode> entity = new HttpEntity<>(requestBody, headers);

            // Send request to RAG service
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ragServiceUrl,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                return responseBody.getOrDefault("answer", "I couldn't find an answer to your question.").toString();
            } else {
                return "Sorry, I couldn't get an answer from the knowledge base.";
            }
        } catch (Exception e) {
            return "Sorry, I couldn't access the general knowledge base: " + e.getMessage();
        }
    }

    /**
     * Handle unknown questions - try both approaches
     */
    private String handleUnknownQuestion(String question, Etudiant student) {
        // First try as personal question
        String personalAnswer = handlePersonalQuestion(question, student);

        // If personal query didn't produce meaningful result, try general
        if (personalAnswer.contains("couldn't determine") || personalAnswer.contains("don't understand")) {
            return handleGeneralQuestion(question);
        }

        return personalAnswer;
    }

    /**
     * Infer personal intent from question keywords
     */
    private String inferPersonalIntent(String question) {
        String lowerQuestion = question.toLowerCase();

        if (lowerQuestion.contains("average") || lowerQuestion.contains("mean") || lowerQuestion.contains("gpa")) {
            return "average";
        } else if (lowerQuestion.contains("highest") || lowerQuestion.contains("best") || lowerQuestion.contains("top")) {
            return "highest_grade";
        } else if (lowerQuestion.contains("lowest") || lowerQuestion.contains("worst") || lowerQuestion.contains("bottom")) {
            return "lowest_grade";
        } else if (lowerQuestion.contains("all") && (lowerQuestion.contains("grade") || lowerQuestion.contains("score"))) {
            return "all_grades";
        } else if (lowerQuestion.contains("subject") || lowerQuestion.contains("course")) {
            return "subjects";
        } else if (lowerQuestion.contains("exam") || lowerQuestion.contains("test") || lowerQuestion.contains("upcoming")) {
            return "upcoming_exams";
        }

        return "unknown";
    }



    private String getStudentAverage(Etudiant student) {
        try {
            List<EtudiantMoyenneDTO> averages = noteService.getAllEtudiantsWithMoyenne();
            double average = averages.stream()
                    .filter(a -> a.getId().equals(student.getId()))
                    .findFirst()
                    .map(EtudiantMoyenneDTO::getMoyenne)
                    .orElse(0.0);

            return String.format("Your current average is %.2f", average);
        } catch (Exception e) {
            return "Sorry, I couldn't retrieve your average at the moment.";
        }
    }

    private String getHighestGrade(Etudiant student) {
        try {
            List<Note> notes = noteService.getNotesByEtudiantId(student.getId());
            if (notes.isEmpty()) {
                return "You don't have any grades recorded yet.";
            }

            Note highestNote = notes.stream()
                    .max(Comparator.comparing(Note::getValeur))
                    .orElse(null);

            if (highestNote != null) {
                return String.format("Your highest grade is %.2f in %s",
                        highestNote.getValeur(),
                        highestNote.getMatiere() != null ? highestNote.getMatiere().getNom() : "Unknown Subject");
            }

            return "Could not determine your highest grade.";
        } catch (Exception e) {
            return "Sorry, I couldn't retrieve your highest grade at the moment.";
        }
    }

    private String getLowestGrade(Etudiant student) {
        try {
            List<Note> notes = noteService.getNotesByEtudiantId(student.getId());
            if (notes.isEmpty()) {
                return "You don't have any grades recorded yet.";
            }

            Note lowestNote = notes.stream()
                    .min(Comparator.comparing(Note::getValeur))
                    .orElse(null);

            if (lowestNote != null) {
                return String.format("Your lowest grade is %.2f in %s",
                        lowestNote.getValeur(),
                        lowestNote.getMatiere() != null ? lowestNote.getMatiere().getNom() : "Unknown Subject");
            }

            return "Could not determine your lowest grade.";
        } catch (Exception e) {
            return "Sorry, I couldn't retrieve your lowest grade at the moment.";
        }
    }

    private String getAllGrades(Etudiant student) {
        try {
            List<Note> notes = noteService.getNotesByEtudiantId(student.getId());
            if (notes.isEmpty()) {
                return "You don't have any grades recorded yet.";
            }

            StringBuilder response = new StringBuilder("Here are all your grades:\n");
            for (Note note : notes) {
                String subjectName = note.getMatiere() != null ? note.getMatiere().getNom() : "Unknown Subject";
                response.append(String.format("• %s: %.2f\n", subjectName, note.getValeur()));
            }

            return response.toString();
        } catch (Exception e) {
            return "Sorry, I couldn't retrieve your grades at the moment.";
        }
    }

    private String getStudentSubjects(Etudiant student) {
        try {
            List<Note> notes = noteService.getNotesByEtudiantId(student.getId());
            if (notes.isEmpty()) {
                return "You don't have any subjects recorded yet.";
            }

            List<String> subjects = notes.stream()
                    .map(note -> note.getMatiere())
                    .filter(matiere -> matiere != null)
                    .map(Matiere::getNom)
                    .distinct()
                    .collect(Collectors.toList());

            if (subjects.isEmpty()) {
                return "You don't have any subjects recorded yet.";
            }

            StringBuilder response = new StringBuilder("Your subjects are:\n");
            for (String subject : subjects) {
                response.append("• ").append(subject).append("\n");
            }

            return response.toString();
        } catch (Exception e) {
            return "Sorry, I couldn't retrieve your subjects at the moment.";
        }
    }

    private String getUpcomingExams(Etudiant student) {
        try {
            List<Exam> exams = examService.getAllExams();
            LocalDateTime now = LocalDateTime.now();

            List<Exam> upcomingExams = exams.stream()
                    .filter(exam -> exam.getDate() != null &&
                            exam.getStartTime() != null &&
                            LocalDateTime.of(exam.getDate(), exam.getStartTime()).isAfter(now))
                    .sorted(Comparator.comparing(exam -> LocalDateTime.of(exam.getDate(), exam.getStartTime())))
                    .collect(Collectors.toList());

            if (upcomingExams.isEmpty()) {
                return "You don't have any upcoming exams scheduled.";
            }

            StringBuilder response = new StringBuilder("Your upcoming exams are:\n");
            for (Exam exam : upcomingExams) {
                response.append(String.format("• %s on %s at %s\n",
                        exam.getTitle(),
                        exam.getDate().toString(),
                        exam.getStartTime().toString()));
            }

            return response.toString();
        } catch (Exception e) {
            return "Sorry, I couldn't retrieve your upcoming exams at the moment.";
        }
    }
}