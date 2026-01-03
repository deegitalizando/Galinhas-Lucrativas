
import { GoogleGenAI, Type } from "@google/genai";
import { FlockEntry, InventoryResult } from "../types";

export const generateInventoryReport = async (
  flocks: FlockEntry[]
): Promise<InventoryResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const flockData = flocks.map(f => 
    `- Lote: ${f.name}, Qtd: ${f.quantity}, Idade: ${f.ageInWeeks} semanas, Linhagem: ${f.lineage}`
  ).join('\n');

  const prompt = `Atue como um gestor de inventário avícola experiente. 
    Com base na seguinte lista de lotes ativos, organize um relatório de 'Censo da Granja'.
    
    Lotes ativos:
    ${flockData}

    Categorias exigidas:
    1. Fase de Cria (Pintinhos: até 5 semanas)
    2. Recria (Frangas: 6 a 18 semanas)
    3. Produção (Poedeiras ativas: 19 a 75 semanas)
    4. Descarte (Aves velhas: acima de 75 semanas)

    Para aves em produção:
    - Informe há quantas semanas estão botando (Idade - 18).
    - Estime vida útil produtiva restante.
    - Defina urgência de substituição (low, medium, high).

    Retorne um JSON estruturado conforme o censo.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalBirds: { type: Type.NUMBER },
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                totalCount: { type: Type.NUMBER },
                flocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      quantity: { type: Type.NUMBER },
                      age: { type: Type.NUMBER },
                      stats: {
                        type: Type.OBJECT,
                        properties: {
                          layingWeeks: { type: Type.NUMBER },
                          remainingProductiveWeeks: { type: Type.NUMBER },
                          replacementUrgency: { type: Type.STRING }
                        }
                      }
                    },
                    required: ["name", "quantity", "age"]
                  }
                }
              },
              required: ["category", "totalCount", "flocks"]
            }
          },
          managerAnalysis: { type: Type.STRING }
        },
        required: ["totalBirds", "categories", "managerAnalysis"]
      }
    }
  });

  return JSON.parse(response.text) as InventoryResult;
};
