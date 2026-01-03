
import { GoogleGenAI, Type } from "@google/genai";
import { BiosecurityResult } from "../types";

export const analyzeBiosecurity = async (
  batchName: string,
  initialCount: number,
  lostCount: number,
  previousLosses: number,
  birdAge: string
): Promise<BiosecurityResult> => {
  // Use strictly process.env.API_KEY and named parameter for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Atue como um analista de biosseguridade experiente. 
    Recebi os seguintes dados do lote "${batchName}":
    - Quantidade inicial do lote: ${initialCount} aves.
    - Mortes ocorridas HOJE: ${lostCount} aves.
    - Mortes acumuladas anteriores: ${previousLosses} aves.
    - Idade das aves: ${birdAge}.

    Tarefa:
    1. Calcule a nova taxa de mortalidade acumulada (total de mortes / inicial * 100).
    2. Identifique se a perda de HOJE (${lostCount}) é superior a 2% do total inicial (${initialCount}).
    3. Se for superior a 2%, emita um ALERTA VERMELHO e liste as 3 causas mais prováveis para mortes súbitas nesta idade (${birdAge}).
    4. Forneça procedimentos de emergência sanitária se o alerta for acionado.
    5. Se for normal, apenas atualize o inventário de aves vivas e dê uma análise tranquilizadora.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cumulativeMortalityRate: { type: Type.NUMBER },
          isRedAlert: { type: Type.BOOLEAN },
          liveBirdsRemaining: { type: Type.NUMBER },
          probableCauses: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          analysis: { type: Type.STRING },
          emergencyProcedures: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["cumulativeMortalityRate", "isRedAlert", "liveBirdsRemaining", "probableCauses", "analysis", "emergencyProcedures"]
      }
    }
  });

  return JSON.parse(response.text) as BiosecurityResult;
};