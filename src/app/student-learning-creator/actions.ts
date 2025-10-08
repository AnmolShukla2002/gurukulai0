
'use server'

import { VertexAI } from '@google-cloud/vertexai';

export async function generateChapter(topic: string, learningStyle: string) {
  const vertexai = new VertexAI({
    project: process.env.PROJECT_ID,
    location: process.env.LOCATION,
  });

  const model = vertexai.preview.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  const prompt = `Create a learning chapter on the topic of "${topic}". The chapter should be tailored to a "${learningStyle}" learning style. The chapter should be engaging, informative, and easy to understand. It should include a variety of learning materials, such as text, images, and interactive elements. The chapter should also include a quiz at the end to test the user's understanding of the material.`;

  try {
    const result = await model.generateContent(prompt);
    const chapter = result.response.candidates[0].content.parts[0].text;
    return { success: true, chapter };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An error occurred while generating the chapter.' };
  }
}
