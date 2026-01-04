
import { GoogleGenAI, Type } from "@google/genai";
import { FinanceResult } from "../types";

export const calculateFinance = async (
  birdCount: number,
  eggCount: number,
  feedExpense: number,
  sellPricePerDozen: number
): Promise<FinanceResult | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    console.error("Chave de API do Gemini não configurada.");
    return null;
  }

  try {
    // Fixed: Always use the strict initialization format for GoogleGenAI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Atue como um consultor financeiro de elite para agronegócio avícola. 
      Analise os seguintes dados de uma granja (período diário):
      - Plantel de Aves: ${birdCount}
      - Produção do dia: ${eggCount} ovos
      - Custo operacional diário: R$ ${feedExpense}
      - Preço praticado por dúzia: R$ ${sellPricePerDozen}

      Sua tarefa é fornecer análise de lucro e dicas de melhoria em JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productivityPercentage: { type: Type.NUMBER },
            costPerEgg: { type: Type.NUMBER },
            revenue: { type: Type.NUMBER },
            netProfit: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            improvementTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  reason: { type: Type.STRING },
                  solution: { type: Type.STRING }
                },
                required: ["reason", "solution"]
              }
            }
          },
          required: ["productivityPercentage", "costPerEgg", "revenue", "netProfit", "analysis", "improvementTips"]
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text) as FinanceResult;
  } catch (error: any) {
    console.error("Erro na consultoria financeira IA:", error.message);
    return null;
  }
};
