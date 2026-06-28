# Gist - AI-Powered Reading Assistant

Gist is a modern, premium reading web application designed to help you understand complex literature and PDFs. It extracts text from uploaded PDF books, breaks them down into pages, and provides an AI reading assistant to simplify passages on-the-fly and answer questions using context-rich RAG (Retrieval-Augmented Generation).

---

## 🛠️ Prerequisites

Before getting started, make sure you have the following installed:
- **Java 17** or higher
- **Node.js** (v18 or higher recommended) and **npm**
- **PostgreSQL** database (configured for the backend)

---

## 🚀 Getting Started

To run the full application locally, you will need to start both the **backend** and the **frontend** servers.

### 1. Starting the Backend (Spring Boot)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. **Configure Environment Variables**:
   Ensure your database and AI services are configured in `src/main/resources/application.yml` (or via environment variables):
   - Database connection settings (PostgreSQL)
   - Cloudinary credentials (for cover page thumbnails)
   - API keys for AI providers:
     - `GROQ_API_KEY` (Priority 1)
     - `GEMINI_API_KEY` (Priority 2)
     - `HF_API_KEY` (Priority 3 - fallback)

3. Run the Spring Boot application using the Maven Wrapper:
   * **Windows (PowerShell/CMD)**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * **Mac/Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```

The backend server will start running on **`http://localhost:8080`**.

---

### 2. Starting the Frontend (React + Vite + Tailwind CSS v4)

1. Open a second terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install the node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend server will start running on **`http://localhost:5173`**. Open this URL in your browser to launch Gist!

---

## 🧭 Project Architecture

* **`/backend`**: Java 17 + Spring Boot 3.3.0 web service using Spring Security (JWT), Spring Data JPA (Hibernate), and a custom circuit-breaker-protected AI Fallback Chain (Groq $\rightarrow$ Gemini $\rightarrow$ HuggingFace).
* **`/frontend`**: React 19 + Vite 8 + Tailwind CSS v4 featuring glassmorphism themes, dynamic reading page adjustments, interactive chat, and a centered library layout.
