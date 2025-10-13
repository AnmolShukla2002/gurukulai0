import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const schema = `
  - _id: ObjectId
  - title: string
  - content: string
  - classroomId: ObjectId
  - createdAt: Date
`;

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
    // Clean the response to get valid JSON
    const jsonString = text.replace(/```json\n|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating MongoDB query:', error);
    return null;
  }
}
