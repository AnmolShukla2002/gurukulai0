
'use server';

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

export async function generateQuestionPaper(formData: FormData) {
  const format = formData.get('format') as string;
  const instructions = formData.get('instructions') as string;
  const referenceFile = formData.get('reference-file') as File | null;
  const contentFiles = formData.getAll('content-file') as File[];

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string });

  const textPrompt = `Create a question paper with the following specifications:

**Format:**
${format}

**Instructions:**
${instructions}

Please strictly follow all the instructions given and generate a question paper and answer key as two separate sections. If a reference file is provided, create a paper with a similar format and style, but with different questions based on the content files if they are also provided.
`;

  const promptParts: Part[] = [
    { text: textPrompt },
  ];

  if (referenceFile && referenceFile.size > 0) {
    const filePart = await fileToGenerativePart(referenceFile);
    promptParts.push(filePart);
  }

  if (contentFiles && contentFiles.length > 0 && contentFiles[0].size > 0) {
    for (const file of contentFiles) {
        const filePart = await fileToGenerativePart(file);
        promptParts.push(filePart);
    }
  }

  try {
    const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }]
    });
    const response = await result.response;
    const text = await response.text();
    return { success: true, questionPaper: text };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate question paper.' };
  }
}
