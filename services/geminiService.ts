
import { GoogleGenAI } from "@google/genai";

export const askRuleAssistant = async (question: string, context: string) => {
  // 가이드라인에 따라 호출 시점에 인스턴스를 생성하여 환경 변수를 안전하게 참조합니다.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      You are an AI Governance Expert for EPLIM. Below is the organization's AI Constitution and Operating Rules.
      
      RULES CONTEXT:
      ${context}

      USER QUESTION:
      ${question}

      Provide a clear, authoritative, and helpful answer based ONLY on the provided rules. 
      If the rules do not cover the topic, state that clearly and suggest consulting the legal team.
      Keep the tone professional and concise. Respond in Korean.
    `,
  });

  return response.text;
};
