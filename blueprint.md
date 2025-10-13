
# Project Blueprint

## Overview

This project provides AI-powered tools for both teachers and students to enhance the learning and teaching experience.

## Implemented Features

*   **Teacher & Student Features:** Includes dashboards, a question paper generator, a learning chapter creator, a presentation coach, paper comparison, and answer evaluation tools.
*   **AI-Powered Chatbot:** An integrated AI assistant for teachers.
*   **Student Dashboard Enhancements:** Redesigned UI with stat cards and placeholders for "My Learning Library".
*   **Save Generated Chapters:** Students can save their generated chapters to a MongoDB collection.

## New Features

### 1. Goals & Progress Feature

**Plan:**

1.  **Create a new API route** at \`src/app/api/student/goals/route.ts\` to manage goals (Create, Read, Update).
2.  **Replace the placeholder page** at \`src/app/student/goals/page.tsx\` with a functional UI for setting and tracking goals.
3.  **Implement a goal creation form** allowing students to define their objectives (e.g., number of chapters to complete).
4.  **Display goals** with visual progress bars.
5.  **Integrate automatic progress tracking** by updating the \`POST /api/student/chapters\` endpoint to increment goal progress when a chapter is saved.
