
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

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const promptParts: (string | Part)[] = [
    `Create a question paper with the following specifications:

    **Format:**
    ${format}

    **Instructions:**
    ${instructions}

    PLease strictly follow all the instructions given and generate a question paper and answer key as two separate sections.
    `,
  ];

  if (referenceFile && referenceFile.size > 0) {
    const filePart = await fileToGenerativePart(referenceFile);
    promptParts.push('**Reference File:**', filePart);
  }

  if (contentFiles && contentFiles.length > 0 && contentFiles[0].size > 0) {
    const fileParts = await Promise.all(contentFiles.map(fileToGenerativePart));
    promptParts.push('**Content Files:**', ...fileParts);
  }

  try {
    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = await response.text();
    return { success: true, questionPaper: text };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate question paper.' };
  }
}
