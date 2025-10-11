'use server'

import { GoogleGenerativeAI, Part } from '@google/generative-ai';

export interface QuizQuestion {
  question: string;
  answer: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string });

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

export async function parseQuizPdf(formData: FormData): Promise<{ success: boolean; quizData?: QuizQuestion[]; error?: string }> {
  try {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided.' };
    }

    // Convert the PDF file to a Gemini-compatible part
    const pdfPart = await fileToGenerativePart(file);

    // Create the prompt for Gemini
    const extractionPrompt = `Analyze this PDF document and extract questions and answers from it.
    Rules:
    1. Only extract actual questions and their answers
    2. Make sure questions end with question marks
    3. Return at least 3 questions if possible
    4. Keep answers concise but complete
    5. If no clear questions are found, create relevant questions from the main topics
    6. Format your response EXACTLY as shown in the example below - no markdown, no code blocks, no extra text
    
    Example format:
    [{"question":"What is the capital of France?","answer":"Paris"},{"question":"Who wrote Romeo and Juliet?","answer":"William Shakespeare"}]
    
    IMPORTANT: Return only the JSON array - no markdown, no code blocks, no other text.`;

    const extractionResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: extractionPrompt }, pdfPart] }]
    });
    
    let jsonString = extractionResult.response.text().trim();
    
    // Clean up the response to handle markdown code blocks and other formatting
    jsonString = jsonString
      .replace(/```json\n?/g, '') // Remove ```json
      .replace(/```\n?/g, '')     // Remove closing ```
      .replace(/^\s*\[/, '[')     // Ensure array starts at beginning
      .replace(/\]\s*$/, ']')     // Ensure array ends properly
      .trim();
    
    try {
      const quizData: QuizQuestion[] = JSON.parse(jsonString);

      if (!Array.isArray(quizData) || quizData.length === 0) {
        throw new Error('Invalid quiz data format');
      }

      // Validate each question object
      const validQuizData = quizData.filter(q => 
        q && typeof q === 'object' && 
        typeof q.question === 'string' && 
        typeof q.answer === 'string' &&
        q.question.trim() !== '' && 
        q.answer.trim() !== ''
      );

      if (validQuizData.length === 0) {
        throw new Error('No valid questions found in the PDF');
      }

      return { success: true, quizData: validQuizData };
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return { success: false, error: 'Failed to process the extracted questions' };
    }
  } catch (error) {
    console.error('PDF processing error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process PDF' 
    };
  }
}

export async function evaluateSpokenAnswer(userAnswer: string, correctAnswer: string): Promise<{ success: boolean; feedback?: string; isCorrect?: boolean; error?: string }> {
  try {
    const evaluationPrompt = `Role: You are an expert quiz evaluator
Target Answer: "${correctAnswer}"
Student's Answer: "${userAnswer}"
Task: Compare answers semantically, ignoring minor differences in wording. Focus on core concepts and meaning.
Output Format: JSON with structure:
{
  "isCorrect": boolean (true if the core concepts match),
  "feedback": string (encouraging feedback, max 2 sentences. If incorrect, briefly explain why)
}`;

    const evaluationResult = await model.generateContent(evaluationPrompt);
    const jsonString = evaluationResult.response.text().trim();
    
    try {
      const evaluation = JSON.parse(jsonString);

      // Validate evaluation object
      if (typeof evaluation !== 'object' || 
          typeof evaluation.isCorrect !== 'boolean' || 
          typeof evaluation.feedback !== 'string') {
        throw new Error('Invalid evaluation format');
      }

      return { 
        success: true, 
        feedback: evaluation.feedback, 
        isCorrect: evaluation.isCorrect 
      };
    } catch (parseError) {
      console.error('Evaluation parsing error:', parseError);
      return { success: false, error: 'Failed to process the evaluation' };
    }
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return { success: false, error: 'There was an issue evaluating your answer.' };
  }
}