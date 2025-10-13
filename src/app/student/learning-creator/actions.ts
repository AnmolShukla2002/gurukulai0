
'use server'

import { GoogleGenerativeAI, Part } from '@google/generative-ai';

// A more robust utility to find and extract a JSON object from a string.
const extractJson = (text: string): string | null => {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
  
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      // No valid JSON object found
      return null;
    }
  
    const jsonString = text.substring(startIndex, endIndex + 1);
    return jsonString;
};

async function fileToGenerativePart(file: File): Promise<Part> {
    const base64EncodedData = await file.arrayBuffer().then((buffer) =>
      Buffer.from(buffer).toString('base64')
    );
    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    };
}

export async function generateChapter(formData: FormData) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string });

  const topic = formData.get('topic') as string;
  const learningStyle = formData.get('learning-style') as string;
  const file = formData.get('file') as File | null;

  const promptText = `You are an AI assistant designed to create personalized learning experiences. Your task is to convert a given topic into an interactive, text-based learning chapter.

Analyze the topic of "${topic}" and generate a learning chapter.

The chapter's content should be adapted for a "${learningStyle}" learning style, but the entire output must be text-only. Here is how to adapt your writing style:
- For a "Visual" style: Use vivid descriptions, structured timelines (using text), analogies, and well-organized bullet points. Do NOT describe images; instead, create textual content that helps a user visualize the topic.
- For an "Auditory" style: Use a conversational, engaging tone, ask rhetorical questions, and structure content as if it were a script or podcast segment.
- For a "Kinesthetic" style: Use action-oriented language, provide real-world examples, and present step-by-step processes or case studies.
- For a "Reading/Writing" style: Use clear definitions, detailed explanations, and a formal, well-structured format.

If a file is provided, use its content as the primary source material.

The output must be a single JSON object with the following structure:
{
  "id": "1",
  "flashcards": [
    {
      "id": "1",
      "front": "A short title, keyword, or question for the front of the flashcard.",
      "back": "The detailed definition or answer for the back of the flashcard. This must be text."
    }
  ],
  "questions": [
    {
      "id": "1",
      "type": "multiple-choice",
      "question": "A question to test understanding, based to some extent on the flashcards.",
      "options": [ "Option A", "Option B", "Option C", "Option D" ],
      "answer": "The correct option."
    },
    {
      "id": "2",
      "type": "theory",
      "question": "A theoretical question to assess deeper understanding.",
      "answer": "A detailed, text-based answer for the theory question."
    }
  ]
}

The flashcards should cover the key concepts, definitions, and formulas of the topic.
The questions should be a mix of multiple-choice and theory questions to assess understanding at different levels.
The content should be engaging, informative, and easy to understand. Please provide the output in a single JSON block.`;

    const promptParts: Part[] = [
      { text: promptText }
    ];

    if (file && file.size > 0) {
        const filePart = await fileToGenerativePart(file);
        promptParts.push(filePart);
    }

  try {
    const result = await model.generateContent({contents: [{role: "user", parts:promptParts}]});
    const responseText = result.response.text();
    const jsonString = extractJson(responseText);

    if (!jsonString) {
      throw new Error("The AI did not return a valid chapter structure. Please try refining your topic.");
    }

    const chapter = JSON.parse(jsonString);
    return { success: true, chapter };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `An error occurred while generating the chapter: ${errorMessage}` };
  }
}

export async function evaluateTheoryQuestion(userAnswer: string, correctAnswer: string) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string });

  const prompt = `You are an expert evaluator. A student was asked the following question:
  
  Correct Answer: "${correctAnswer}"

  The student provided this answer: "${userAnswer}"

  Your task is to:
  1. Determine if the student's answer is correct, partially correct, or incorrect.
  2. Provide a brief explanation for your evaluation.
  3. Explain the correct answer clearly if the student's answer is not perfectly correct.

  Provide the output as a single JSON object with the following structure:
  {
    "evaluation": "correct" | "partially-correct" | "incorrect",
    "feedback": "Your detailed explanation here."
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = extractJson(responseText);

    if (!jsonString) {
      throw new Error("The AI did not return a valid evaluation.");
    }
    
    const evaluation = JSON.parse(jsonString);
    return { success: true, evaluation };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to evaluate theory answer." };
  }
}

interface QuizResult {
  questionId: string;
  question: string;
  type: 'multiple-choice' | 'theory';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  evaluation?: {
    evaluation: string;
    feedback: string;
  };
}

export async function generateQuizFeedback(results: QuizResult[]) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string });

  const score = results.filter(r => r.isCorrect || r.evaluation?.evaluation === 'correct').length;
  const total = results.length;

  const prompt = `You are a helpful and encouraging teaching assistant. A student has just completed a quiz. Here are their results:

  ${JSON.stringify(results, null, 2)}

  Your task is to provide a comprehensive and clear summary for the student. The summary should include:
  1. The final score (e.g., "You scored ${score} out of ${total}").
  2. A "Key Takeaways" section that praises them for correct answers and provides constructive feedback for incorrect ones.
  3. A "Detailed Review" section. For each incorrect or partially-correct answer, explain the concept again clearly and concisely.
  4. If the answer was correct, briefly praise the user and add an interesting fact or deeper insight related to the topic.

  Format the output as a single JSON object with this structure:
  {
    "score": ${score},
    "total": ${total},
    "scoreText": "Your score summary text, e.g., 'You scored ${score} out of ${total}'.",
    "keyTakeaways": "A summary of performance.",
    "detailedReview": [
      {
        "question": "The original question.",
        "yourAnswer": "The user's answer.",
        "isCorrect": true,
        "feedback": "The detailed explanation for this specific question."
      }
    ]
  }
  Be positive and encouraging in your tone.
  `;
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = extractJson(responseText);

    if (!jsonString) {
        throw new Error("The AI did not return valid feedback.");
    }
    const feedback = JSON.parse(jsonString);
    return { success: true, feedback };
  } catch (error)
 {
    console.error(error);
    return { success: false, error: "Failed to generate final feedback." };
  }
}
