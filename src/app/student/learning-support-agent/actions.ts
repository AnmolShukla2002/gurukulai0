'use server'

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface QuizQuestion {
  question: string;
  answer: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string });

export async function evaluateSpokenAnswer(userAnswer: string, correctAnswer: string): Promise<{ success: boolean; feedback?: string; isCorrect?: boolean; error?: string }> {
  try {
    const prompt = `You are an expert quiz evaluator. The correct answer to a question is:
    
    Correct Answer: "${correctAnswer}"
    
    A student provided the following spoken answer:
    
    Student's Answer: "${userAnswer}"
    
    Your task is to:
    1. Determine if the student's answer is semantically correct. It doesn't need to be word-for-word, but it must contain the key concepts.
    2. Provide a short, encouraging feedback message. If the answer is incorrect, gently explain the correct answer.
    
    Provide the output as a single JSON object with the structure:
    {
      "isCorrect": boolean,
      "feedback": "Your feedback message here."
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json\n|```/g, '').trim();
    const evaluation = JSON.parse(jsonString);

    return { success: true, feedback: evaluation.feedback, isCorrect: evaluation.isCorrect };
    
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return { success: false, error: 'There was an issue evaluating your answer.' };
  }
}

