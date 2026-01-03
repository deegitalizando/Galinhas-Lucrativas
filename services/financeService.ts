
import { GoogleGenAI, Type } from "@google/genai";
import { FinanceResult } from "../types";

export const calculateFinance = async (
  birdCount: number,
  eggCount: number,
  feedExpense: number,
  sellPricePerDozen: number
): Promise<FinanceResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Atue como um consultor financeiro de elite para agronegócio avícola. 
    Analise os seguintes dados de uma granja (período diário):
    - Plantel de Aves: ${birdCount}
    - Produção do dia: ${eggCount} ovos
    - Custo operacional diário: R$ ${feedExpense}
    - Preço praticado por dúzia: R$ ${sellPricePerDozen}

    Sua tarefa é fornecer:
    1. Uma análise precisa da margem de lucro e eficiência.
    2. Identificar se o preço de venda está adequado à realidade do mercado.
    3. SUGESTÕES DE MELHORIA PARA MAIOR FATURAMENTO: Pense em estratégias como venda de subprodutos (esterco), tipos de ovos (caipira, orgânico), embalagens premium, ou otimização de logística.
    4. Plano de ação para reduzir o custo por ovo.

    Seja motivador, use dados e retorne um JSON estruturado.`;

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

  return JSON.parse(response.text) as FinanceResult;
};
