
import { GoogleGenAI, Type } from "@google/genai";
import { FlockResult } from "../types";

export const registerFlock = async (
  arrivalDate: string,
  lineage: string,
  quantity: number,
  ageInWeeks: number
): Promise<FlockResult | null> => {
  // Verificação rigorosa da chave de API
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    console.warn("Chave de API do Gemini não detectada ou inválida. O plano de manejo será gerado manualmente mais tarde.");
    return null;
  }

  try {
    // Fixed: Always use the strict initialization format for GoogleGenAI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Atue como Especialista em Nutrição e Manejo Avícola. 
      Lote: ${lineage}, Quantidade: ${quantity} aves, Idade Atual: ${ageInWeeks} semanas.
      Data de chegada: ${arrivalDate}.

      Forneça um plano de manejo nutricional e sanitário rigorosamente no formato JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            estimatedLayingDate: { type: Type.STRING },
            feedConsumptionInfo: {
              type: Type.OBJECT,
              properties: {
                dailyPerBirdGrams: { type: Type.NUMBER },
                monthlyTotalKg: { type: Type.NUMBER },
                currentFeedType: { type: Type.STRING }
              },
              required: ["dailyPerBirdGrams", "monthlyTotalKg", "currentFeedType"]
            },
            nextFeedChange: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.NUMBER },
                targetFeedType: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["week", "targetFeedType", "description"]
            },
            vaccinationSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.NUMBER },
                  date: { type: Type.STRING },
                  vaccine: { type: Type.STRING },
                  method: { type: Type.STRING }
                },
                required: ["week", "date", "vaccine", "method"]
              }
            },
            biosecurityProtocols: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            healthAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "summary", 
            "estimatedLayingDate", 
            "feedConsumptionInfo", 
            "nextFeedChange", 
            "vaccinationSchedule", 
            "biosecurityProtocols", 
            "healthAlerts"
          ]
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text) as FlockResult;
  } catch (err) {
    console.error("Erro ao consultar a IA (Gemini):", err);
    return null;
  }
};
