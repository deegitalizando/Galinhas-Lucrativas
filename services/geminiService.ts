
import { GoogleGenAI, Type } from "@google/genai";
import { Ingredient, AnimalPhase, FormulationResult } from "../types";

export const calculateFormulation = async (
  ingredients: Ingredient[],
  phase: AnimalPhase
): Promise<FormulationResult | null> => {
  // Use strictly process.env.API_KEY and named parameter for initialization
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    console.error("Chave de API do Gemini não configurada ou inválida.");
    return null;
  }

  try {
    // Fixed: Always use the strict initialization format for GoogleGenAI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const ingredientData = ingredients
      .map(i => `${i.name}: R$ ${i.pricePerKg.toFixed(2)}/kg`)
      .join(", ");

    const prompt = `Atue como um especialista em nutrição animal. 
      Calcule uma fórmula de 100kg de ração para ${phase}.
      Ingredientes e preços: ${ingredientData}.
      
      Seu objetivo: atingir os níveis nutricionais ideais de proteína e energia para esta fase gastando o mínimo possível. 
      Se houver um ingrediente muito caro, sugira substitutos mais baratos.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            composition: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ingredient: { type: Type.STRING },
                  weightKg: { type: Type.NUMBER },
                  cost: { type: Type.NUMBER }
                },
                required: ["ingredient", "weightKg", "cost"]
              }
            },
            totalCost: { type: Type.NUMBER },
            proteinLevel: { type: Type.NUMBER },
            energyLevel: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["composition", "totalCost", "proteinLevel", "energyLevel", "suggestions"]
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text) as FormulationResult;
  } catch (error: any) {
    console.error("Erro na formulação IA:", error.message);
    return null;
  }
};
