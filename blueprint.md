
# Project Blueprint

## Overview

This project is a web application that provides several tools for teachers and students. The application will have a clean and modern user interface, following Google's Material Design principles.

## Design

*   **Color Palette:** The application uses a vibrant, Google-inspired color palette to create a visually engaging and consistent user experience.
    *   `google-blue`: `#4285F4`
    *   `google-red`: `#DB4437`
    *   `google-yellow`: `#F4B400`
    *   `google-green`: `#0F9D58`

## Implemented Features

*   **Home Page:** A simple and aesthetically pleasing home page that introduces the application's features.
    *   **Layout:** A centered layout with a title and three feature cards.
    *   **Styling:** Modern and clean design with a white background, grey text, and subtle shadows.
    *   **Icons:** Use of SVG icons to visually represent each feature.
    *   **Color Scheme:** The header uses the `google-blue` color, and the feature cards use the `google-red`, `google-yellow`, and `google-green` colors.

*   **Teacher Helper Question Paper Generator:** An intelligent question paper generator that streamlines the assessment creation process through advanced AI understanding of educational formats and content analysis.
    *   **Status:** Completed
    *   **AI Model:** `gemini-1.5-flash-002`
    *   **User Workflow:**
        *   **Format Specification (Optional):** Teachers can input a detailed paper structure (e.g., "5 true/false questions, 5 match the following, 5 brief questions worth 5 marks each").
        *   **Reference Integration:** Teachers can upload previous year papers for format consistency and style matching.
        *   **Content Upload:** Teachers can upload textbooks, study units, and reference materials in PDF, DOCX, or PPT formats.
        *   **Custom Instructions:** Teachers can specify portion-wise marks distribution and other requirements like question complexity.
        *   **Generation & Output:** A one-click generation process that produces a complete question paper and a comprehensive answer key.
    *   **Export Functionality:**
        *   **Export as DOC:** Users can export the generated question paper as a Microsoft Word document.
        *   **Export as PDF:** Users can export the generated question paper as a PDF document.
    *   **Color Scheme:** The header uses the `google-red` color.

*   **Student Dynamic Learning Chapter Creator:** A tool that allows students to generate personalized learning chapters on any topic they choose.
    *   **Status:** Implemented
    *   **AI Model:** `gemini-1.5-flash-001`
    *   **User Workflow:**
        *   **Topic:** Students can enter any topic they want to learn about.
        *   **Learning Style:** Students can specify their preferred learning style (e.g., Visual, Auditory, Kinesthetic, Reading/Writing).
        *   **Chapter Generation:** The AI generates a personalized learning chapter with a quiz at the end.
    *   **Color Scheme:** The header uses the `google-yellow` color.

*   **Learning Support Oral Agent:** An AI-powered conversational assessment system that evaluates student knowledge through natural dialogue and provides comprehensive feedback.
    *   **Status:** Completed
    *   **AI Model:** `gem-1.5-flash-001`
    *   **User Workflow:**
        *   **Chapter Selection:** Students choose from uploaded content or an existing repository.
        *   **Interactive Session Initiation:** One-click start for immediate oral assessment.
        *   **Real-time Voice Conversation:** The agent uses real-time speech-to-text and text-to-speech for a natural conversational experience.
        *   **Dynamic Questioning:** Adaptive questioning based on student responses.
        *   **Intelligent Evaluation:** The agent evaluates factual accuracy, conceptual understanding, clarity, coherence, and confidence.
        *   **Immediate Feedback:** The agent provides constructive suggestions and areas for improvement.
    *   **Color Scheme:** The header uses the `google-green` color.

## Next Steps

*   All features are implemented. The application is ready for deployment.
