
'use server';

import { GoogleGenerativeAI, Part } from '@google/generative-ai';

// Helper function to convert a File object to a GoogleGenerativeAI.Part object.
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

// Server action to generate a question paper using the Gemini model.
export async function generateQuestionPaper(formData: FormData) {
  // Extract data from the incoming FormData object.
  const format = formData.get('format') as string;
  const instructions = formData.get('instructions') as string;
  const referenceFile = formData.get('reference-file') as File | null;
  const contentFiles = formData.getAll('content-file') as File[];

  // --- DIAGNOSTIC LOGGING ---
  console.log('--- Server Action: File Upload Diagnosis ---');
  if (referenceFile && referenceFile.size > 0) {
    console.log(`Reference file received: ${referenceFile.name}, size: ${referenceFile.size} bytes`);
  } else {
    console.log('No reference file received or file is empty.');
  }
  if (contentFiles && contentFiles.length > 0 && contentFiles[0].size > 0) {
    console.log(`Received ${contentFiles.length} content file(s).`);
    contentFiles.forEach(file => {
      console.log(`- ${file.name}, size: ${file.size} bytes`);
    });
  } else {
    console.log('No content files received or files are empty.');
  }
  console.log('-------------------------------------------');
  // --- END DIAGNOSTIC LOGGING ---


  const hasReferenceFile = referenceFile && referenceFile.size > 0;
  const hasContentFiles = contentFiles && contentFiles.length > 0 && contentFiles[0].size > 0;

  if (!hasReferenceFile && !hasContentFiles) {
    return { 
      success: false, 
      error: 'No files were received by the server. This often happens if uploaded files exceed the server\'s size limit (default is 1MB). Please try with smaller files or contact support to increase the limit.' 
    };
  }

  // Initialize the Google Generative AI client.
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string });

  // Construct the text-based part of the prompt.
  const textPrompt = `Create a question paper with the following specifications:

**Format:**
${format}

**Instructions:**
${instructions}

Please strictly follow all the instructions given and generate a question paper and answer key as two separate sections. The provided files are a reference paper for style and content documents to pull from. Create a paper with a similar format and style to the reference, but with different questions based on the content files.
`;

  // Prepare the parts array for the generative model, starting with files.
  const promptParts: Part[] = [];

  if (hasReferenceFile) {
    try {
      const filePart = await fileToGenerativePart(referenceFile);
      promptParts.push(filePart);
    } catch (error) {
      console.error('Error processing reference file:', error);
      return { success: false, error: 'Failed to process the reference file.' };
    }
  }

  if (hasContentFiles) {
    for (const file of contentFiles) {
      if (file.size > 0) {
        try {
          const filePart = await fileToGenerativePart(file);
          promptParts.push(filePart);
        } catch (error) {
          console.error('Error processing content file:', error);
          return { success: false, error: `Failed to process a content file: ${file.name}` };
        }
      }
    }
  }

  // Add the text prompt at the end.
  promptParts.push({ text: textPrompt });
  
  // Call the generative model.
  try {
    const result = await model.generateContent({
        contents: [{ role: "user", parts: promptParts }]
    });
    const response = await result.response;
    const text = await response.text();
    return { success: true, questionPaper: text };
  } catch (error) {
    console.error('Error generating content from model:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred with the AI model.';
    return { success: false, error: `Failed to generate question paper. ${errorMessage}` };
  }
}
