
import { GoogleGenAI, Type } from "@google/genai";
import { FlockResult } from "../types";

export const registerFlock = async (
  arrivalDate: string,
  lineage: string,
  quantity: number,
  ageInWeeks: number
): Promise<FlockResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Atue como Especialista em Nutrição e Manejo Avícola. 
    Lote: ${lineage}, Quantidade: ${quantity} aves, Idade Atual: ${ageInWeeks} semanas.

    Sua tarefa é fornecer um plano de manejo nutricional preciso:
    1. Calcule o consumo de ração diária por ave para esta idade específica (em gramas).
    2. Calcule o consumo total mensal do lote (30 dias).
    3. Identifique o tipo de ração atual (Inicial, Crescimento ou Postura).
    4. Indique na qual semana deve ocorrer a próxima alteração de ração e para qual tipo.
    5. Crie um cronograma sanitário básico (vacinas Marek e Newcastle) baseado na data de chegada: ${arrivalDate}.

    Retorne os dados rigorosamente no formato JSON especificado.`;

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

  return JSON.parse(response.text) as FlockResult;
};
