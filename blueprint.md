
# Project Blueprint

## Overview

This project provides AI-powered tools for both teachers and students to enhance the learning and teaching experience.

## Implemented Features

*   **Teacher Helper Question Paper Generator:** An AI tool for teachers to generate question papers for any subject and grade.
*   **Student Dynamic Learning Chapter Creator:** A tool that allows students to generate personalized learning chapters on any topic they choose.
*   **Learning Support Agent:** A conversational AI to help students with their questions.

## New Feature: Student and Teacher Dashboards

### Plan

1.  **Create a `blueprint.md` file** to document the plan.
2.  **Create a new Navbar component** in `src/components/Navbar.tsx`.
3.  **Modify the root layout** `src/app/layout.tsx` to include the new Navbar.
4.  **Create a login page** at `src/app/page.tsx` with separate login forms for students and teachers.
5.  **Create a student dashboard** page at `src/app/student/dashboard/page.tsx`.
6.  **Create a teacher dashboard** page at `src/app/teacher/dashboard/page.tsx`.
7.  **Move the existing `student-learning-creator` page** to `src/app/student/learning-creator/page.tsx`.
8.  **Move the existing `teacher-helper` page** to `src/app/teacher/helper/page.tsx`.
9.  **Move the existing `learning-support-agent` page** to `src/app/student/learning-support-agent/page.tsx`.
10. **Update the links** in the existing pages to reflect the new routes.
11. **Delete the old files.**
