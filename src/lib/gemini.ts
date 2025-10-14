import { GoogleGenerativeAI } from '@google/generative-ai';
import { grade9Data, grade10Data, Student } from './mock-data';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const schema = `
  - _id: ObjectId
  - title: string
  - content: string
  - classroomId: ObjectId
  - createdAt: Date
`;

// New function to determine the user's intent
export async function classifyUserIntent(query: string): Promise<'find_documents' | 'analyze_data' | 'unknown'> {
    const prompt = `You are an intent classification expert. Your task is to determine the user's intent based on their query. The user is a teacher.

    Possible intents are:
    1. 'find_documents': The user is looking for specific documents, question papers, or files.
    2. 'analyze_data': The user is asking a question about student performance, grades, averages, top students, or asking for suggestions for improvement.

    Examples:
    - "list all papers" -> find_documents
    - "show me my latest history paper" -> find_documents
    - "who are my top students in grade 9?" -> analyze_data
    - "what are the class averages for grade 10?" -> analyze_data
    - "how can I help my lowest performing students?" -> analyze_data

    User's query: "${query}"

    Respond with ONLY one of the following intents: find_documents, analyze_data`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        if (text === 'find_documents' || text === 'analyze_data') {
            return text;
        }
        return 'unknown';
    } catch (error) {
        console.error('Error classifying intent:', error);
        return 'unknown';
    }
}


export async function generateMongoQuery(query: string) {
  const prompt = `
    You are an expert MongoDB query assistant. Your task is to convert the user's natural language query into a valid MongoDB query object for the 'find' method.
    The user wants to query the 'questionPapers' collection.
    Here is the schema for the 'questionPapers' collection:
    ${schema}
    
    The user's query will be about the 'title' of the paper. You should use a regex for case-insensitive matching.
    
    Here is an example:
    User's query: "latest history paper"
    Your response should be:
    \`\`\`json
    { "title": { "$regex": "history", "$options": "i" } }
    \`\`\`

    Now, generate a query for the following user request. Respond with only the valid MongoDB query in JSON format.

    User's query: "${query}"
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json\n|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating MongoDB query:', error);
    return null;
  }
}

export async function analyzeStudentData(query: string): Promise<string> {
  const prompt = `You are an expert data analyst and educational consultant. Your task is to analyze the provided student data to answer the teacher's question.

  Here is the student data:
  
  **Grade 9 Data:**
  ${JSON.stringify(grade9Data, null, 2)}

  **Grade 10 Data:**
  ${JSON.stringify(grade10Data, null, 2)}

  Analyze the data and provide a direct answer to the following question: "${query}"

  **IMPORTANT:**
  - Do not repeat the teacher's question in your response.
  - Format your response as clean, semantic HTML. 
  - Use tags like <h2>, <h3>, <p>, <strong>, and <ul> for structure.
  - **DO NOT** use any inline styles (e.g., style="...").
  - **DO NOT** include any colors or background properties. The response will be displayed in a dark-themed component.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.replace(/```html\n|```/g, '').trim();
  } catch (error) {
    console.error('Error analyzing student data:', error);
    return '<p>Sorry, I encountered an error while analyzing the data.</p>';
  }
}
