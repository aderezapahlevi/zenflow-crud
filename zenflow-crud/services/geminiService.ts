
import { GoogleGenAI, Type } from "@google/genai";
import { TaskCategory } from "../types";

export const enhanceTaskContent = async (title: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Refine this task. Make the title professional and the description clear and actionable. 
  Original Title: ${title}
  Original Description: ${description}
  
  Also suggest the best category among: ${Object.values(TaskCategory).join(', ')}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedTitle: { type: Type.STRING },
            refinedDescription: { type: Type.STRING },
            suggestedCategory: { 
                type: Type.STRING,
                description: "One of: Work, Personal, Ideas, Urgent"
            }
          },
          required: ["refinedTitle", "refinedDescription", "suggestedCategory"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini AI refinement failed:", error);
    return null;
  }
};
