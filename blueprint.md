
# Project Blueprint

## Overview

This project provides AI-powered tools for both teachers and students to enhance the learning and teaching experience.

## Implemented Features

*   **Teacher & Student Features:** Includes dashboards, a question paper generator, a learning chapter creator, a presentation coach, paper comparison, and answer evaluation tools.
*   **AI-Powered Chatbot:** An integrated AI assistant for teachers.
*   **Student Dashboard Enhancements:** Redesigned UI with stat cards, a functional "My Learning Library," and a "Goals & Progress" tracker.

## New Features

### 1. AI Assistant with Data Analysis

**Plan:**

1.  **Create a new AI function** in `src/lib/gemini.ts` specifically for analyzing student data.
2.  **This function will take a natural language query** and the mock student data as input.
3.  **The AI will be prompted** to act as a data analyst, identifying trends, finding top performers, calculating averages, and providing actionable suggestions for improvement.
4.  **Upgrade the Chatbot API** (`src/app/api/teacher/chatbot/route.ts`) to intelligently route data analysis questions to this new function, while still handling document retrieval queries as before.
