
# Project Blueprint

## Overview

This project provides AI-powered tools for both teachers and students to enhance the learning and teaching experience.

## Implemented Features

*   **Teacher Helper Question Paper Generator:** An AI tool for teachers to generate question papers for any subject and grade.
*   **Student Dynamic Learning Chapter Creator:** A tool that allows students to generate personalized learning chapters on any topic they choose.
*   **Learning Support Agent:** A conversational AI to help students with their questions.
*   **Student and Teacher Dashboards:** Separate dashboards for students and teachers to access their respective tools.
*   **Teacher Chatbot:** An AI assistant to help teachers find their question papers.
*   **Paper Comparison Tool:** An AI-powered tool for teachers to compare two question papers.
*   **Handwritten Answer Sheet Evaluation:** An AI tool to evaluate handwritten student answers.

## New Features

### 1. Student Performance Dashboard (Mock)

**Plan:**

1.  **Create a new page** for the analytics dashboard at `src/app/teacher/analytics/page.tsx`.
2.  **Install `recharts`** for data visualization.
3.  **Create a mock data utility** at `src/lib/mock-data.ts` to generate student and score data for Grade 9 and Grade 10.
4.  **Implement the UI** with tabs, tables, and charts to display class averages, score distributions, and predictive trends.
5.  **Update the teacher dashboard** to include a link to the new analytics page.
