'use server';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Helper function to convert a file to a GenerativePart object
async function fileToGenerativePart(file: File) {
  return {
    inlineData: {
      data: Buffer.from(await file.arrayBuffer()).toString("base64"),
      mimeType: file.type,
    },
  };
}

export interface QuizQuestion {
  question: string;
  spokenQuestion: string; // The conversational version for TTS
  answer: string;
}

export async function generateQuizFromPDF(formData: FormData): Promise<{ success: boolean; quizData?: QuizQuestion[]; error?: string; }> {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error("No file provided.");

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Your tone should be like a friendly, chill teacher. Based on the content of the provided document, create a list of questions and their ideal answers.
        create max 10 questions
        Format the output as a JSON array of objects. Each object must have three keys:
        1.  "question": The question as it would be written.
        2.  "spokenQuestion": The same question, but phrased conversationally as if you were speaking it out loud. For example, instead of "What is photosynthesis?", you might say "Alright, let's start with this one: What exactly is photosynthesis?".
        3.  "answer": The ideal answer to the question.`;
        
        const pdfPart = await fileToGenerativePart(file);
        const result = await model.generateContent([prompt, pdfPart]);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch || !jsonMatch[1]) {
            throw new Error("Could not find a valid JSON block in the AI's response.");
        }
        const jsonText = jsonMatch[1].trim();
        const quizData: QuizQuestion[] = JSON.parse(jsonText);
        
        return { success: true, quizData };

    } catch (error) {
        console.error("Error generating quiz from PDF:", error);
        if (error instanceof Error) {
            return { success: false, error: `Failed to process document: ${error.message}` };
        }
        return { success: false, error: 'An unknown error occurred while processing the document.' };
    }
}


export async function evaluateAudioAnswer(audioFormData: FormData): Promise<{ success: boolean; feedback?: { correctness: string; confidence: string; tone: string;}; error?: string; }> {
    try {
        const audioFile = audioFormData.get('audio') as File;
        const correctAnswer = audioFormData.get('correctAnswer') as string;

        if (!audioFile || !correctAnswer) {
            throw new Error("Audio file and correct answer are required.");
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const audioPart = await fileToGenerativePart(audioFile);

        const prompt = `You are a presentation coach. Analyze the user's spoken audio response to a question. 
        The ideal answer is: "${correctAnswer}".
        
        Evaluate the user's audio on three criteria:
        1.  **Correctness:** How accurate was their answer compared to the ideal answer?
        2.  **Confidence:** How confident did they sound? Note their pacing, use of filler words (like "um" or "ah"), and clarity.
        3.  **Tone:** What was their tone? Was it engaging, monotonous, clear, or mumbled?

        Provide your feedback as a JSON object with three keys: "correctness", "confidence", and "tone". Each key should have a short, constructive feedback string (2-3 sentences) as its value.`;

        const result = await model.generateContent([prompt, audioPart]);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch || !jsonMatch[1]) {
            throw new Error("Could not find a valid JSON feedback block in the AI's response.");
        }
        const jsonText = jsonMatch[1].trim();
        const feedback = JSON.parse(jsonText);

        return { success: true, feedback };

    } catch (error) {
        console.error("Error evaluating audio answer:", error);
        if (error instanceof Error) {
            return { success: false, error: `Failed to evaluate audio: ${error.message}` };
        }
        return { success: false, error: 'An unknown error occurred during audio evaluation.' };
    }
}
