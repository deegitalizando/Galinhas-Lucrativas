
import { GoogleGenAI, Type } from "@google/genai";
import { HandlingResult } from "../types";

export const generateHandlingChecklist = async (
  batchName: string,
  origin: string,
  destination: string,
  birdCount: number
): Promise<HandlingResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Atue como um consultor de manejo avícola sênior. 
    O produtor vai mover o lote "${batchName}" (${birdCount} aves) do "${origin}" para o "${destination}".
    
    Tarefa:
    1. Gere uma lista de verificação (checklist) técnica do que deve ser preparado no novo ambiente antes da chegada das aves.
    2. Categorize os itens em: cama (bedding), bebedouros (waterers), iluminação (lighting) e desinfecção (disinfection).
    3. Recomende um manejo antiestresse detalhado para o dia da mudança (ex: eletrólitos, horários).
    4. Especifique o tipo ideal de cama e horas de luz recomendadas para o destino.

    Retorne um JSON estruturado seguindo rigorosamente a HandlingResult interface.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          batchName: { type: Type.STRING },
          checklist: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['bedding', 'waterers', 'lighting', 'disinfection'] },
                description: { type: Type.STRING }
              },
              required: ["task", "category", "description"]
            }
          },
          antiStressProtocol: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          shedSpecs: {
            type: Type.OBJECT,
            properties: {
              beddingType: { type: Type.STRING },
              lightingHours: { type: Type.STRING }
            },
            required: ["beddingType", "lightingHours"]
          },
          expertNote: { type: Type.STRING }
        },
        required: ["batchName", "checklist", "antiStressProtocol", "shedSpecs", "expertNote"]
      }
    }
  });

  return JSON.parse(response.text) as HandlingResult;
};
