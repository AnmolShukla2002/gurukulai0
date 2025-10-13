
# Project Blueprint

## Overview

This project provides AI-powered tools for both teachers and students to enhance the learning and teaching experience.

## Implemented Features

*   **Teacher Helper Question Paper Generator:** An AI tool for teachers to generate question papers for any subject and grade.
*   **Student Dynamic Learning Chapter Creator:** A tool that allows students to generate personalized learning chapters on any topic they choose.
*   **Learning Support Agent:** A conversational AI to help students with their questions.
*   **Student and Teacher Dashboards:** Separate dashboards for students and teachers to access their respective tools.
*   **Teacher Chatbot:** An AI assistant to help teachers find their question papers.

## New Features

### 1. Enhanced Chatbot with Classroom Information

**Plan:**

1.  **Update the chatbot's API** at `src/app/api/teacher/chatbot/route.ts` to fetch and include the classroom name with each question paper.
2.  **Update the `Sidebar.tsx` component** to display the classroom name alongside the paper title.

### 2. Paper Comparison Tool

**Plan:**

1.  **Create a new page** for the comparison tool at `src/app/teacher/paper-comparison/page.tsx`.
2.  **Create a new API route** at `src/app/api/teacher/paper-comparison/route.ts` to handle the comparison logic.
3.  **Update the teacher dashboard** to include a link to the new tool.
4.  **Implement the UI** for selecting two papers and displaying the comparison.
5.  **Develop the AI-powered comparison logic** in the new API route.
