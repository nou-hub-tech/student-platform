<img width="1913" height="924" alt="Screenshot 2026-05-28 211938" src="https://github.com/user-attachments/assets/e87f8247-4ca0-4092-a113-3a50dcdc2098" />


# Student Platform

Student management platform + RAG chatbot.

* **Frontend:** Angular (student/admin portal)
* **Backend:** Spring Boot (API, authentication, grades, schedules)
* **RAG:** Microservice (university PDFs → answers)

## Getting Started

* **Backend:** `cd backend && mvn spring-boot:run`
* **Frontend:** `cd frontend && npm install && ng serve`
* **RAG:** `cd RAG_MICROSERVICE && uvicorn app:app --reload`
