
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const askRuleAssistant = async (question: string, context: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      You are an AI Governance Expert. Below is the organization's AI Constitution and Operating Rules.
      
      RULES CONTEXT:
      ${context}

      USER QUESTION:
      ${question}

      Provide a clear, authoritative, and helpful answer based ONLY on the provided rules. 
      If the rules do not cover the topic, state that clearly and suggest consulting the legal team.
      Keep the tone professional and concise.
    `,
  });

  return response.text;
};
