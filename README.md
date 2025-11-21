# Student Platform

Plateforme de gestion des étudiants + chatbot RAG.
- Frontend: Angular (portal étudiant/admin)
- Backend: Spring Boot (API, auth, notes, emplois du temps)
- RAG: microservice (PDF université → réponses)

## Démarrer
- Backend: `cd backend && mvn spring-boot:run`
- Frontend: `cd frontend && npm install && ng serve`
- RAG: `cd rag-service` puis lancer selon la techno
