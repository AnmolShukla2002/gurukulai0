
'use server'

import { GoogleGenerativeAI, Part } from '@google/generative-ai';

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
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const topic = formData.get('topic') as string;
  const learningStyle = formData.get('learning-style') as string;
  const file = formData.get('file') as File | null;

  const promptText = `You are an AI assistant designed to create personalized learning experiences. Your task is to convert a given topic into an interactive learning chapter.

Analyze the topic of "${topic}" and generate a learning chapter tailored for a "${learningStyle}" learning style.

If a file is provided, use its content as the primary source material.

The output must be a single JSON object with the following structure:
{
  "id": "1",
  "flashcards": [
    {
      "id": "1",
      "content": "Key concept or definition related to the topic."
    }
  ],
  "questions": [
    {
      "id": "1",
      "type": "multiple-choice",
      "question": "A question to test understanding, based to some extent on the flashcards.",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "The correct option."
    },
    {
      "id": "2",
      "type": "theory",
      "question": "A theoretical question to assess deeper understanding.",
      "answer": "A detailed answer for the theory question."
    }
  ]
}

The flashcards should cover the key concepts, definitions, and formulas of the topic.
The questions should be a mix of multiple-choice and theory questions to assess understanding at different levels.
For theory questions, provide a detailed answer that can be used for semantic matching evaluation.
The content should be engaging, informative, and easy to understand. Please provide the output in a single JSON block.`;

    const promptParts: Part[] = [
      { text: promptText }
    ];

    if (file && file.size > 0) {
        const filePart = await fileToGenerativePart(file);
        promptParts.push(filePart);
    }

  try {
    const result = await model.generateContent(promptParts);
    const responseText = result.response.text();
    
    const jsonStringMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    let chapter;
    if (jsonStringMatch && jsonStringMatch[1]) {
        chapter = JSON.parse(jsonStringMatch[1]);
        console.log(chapter)
    } else {
        chapter = JSON.parse(responseText);
    }

    return { success: true, chapter };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An error occurred while generating the chapter.' };
  }
}

export async function evaluateTheoryQuestion(userAnswer: string, correctAnswer: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const evaluation = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
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
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const score = results.filter(r => r.isCorrect || r.evaluation?.evaluation === 'correct').length;
  const total = results.length;

  const prompt = `You are a helpful and encouraging teaching assistant. A student has just completed a quiz. Here are their results:

  ${JSON.stringify(results, null, 2)}

  Your task is to provide a comprehensive and clear summary for the student. The summary should include:
  1. The final score (e.g., "You scored ${score} out of ${total}").
  2. A "Key Takeaways" section that praises them for correct answers and provides constructive feedback for incorrect ones.
  3. A "Detailed Review" section. For each incorrect or partially-correct answer, explain the concept again clearly and concisely. 

  Format the output as a single JSON object with this structure:
  {
    "scoreText": "Your score summary.",
    "keyTakeaways": "A summary of performance.",
    "detailedReview": [
      {
        "question": "The original question.",
        "yourAnswer": "The user's answer.",
        "feedback": "The detailed explanation for this specific question."
      }
    ]
  }
  Be positive and encouraging in your tone.
  `;
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const feedback = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
    return { success: true, feedback };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate final feedback." };
  }
}
