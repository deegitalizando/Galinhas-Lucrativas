
import { GoogleGenAI, Type } from "@google/genai";
import { VetDiagnosis } from "../types";

export const diagnoseBirdHealth = async (
  base64Images: string[],
  birdDetails: {
    age: string;
    lineage: string;
    description: string;
  }
): Promise<VetDiagnosis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img.split(',')[1] || img,
    },
  }));

  const textPart = {
    text: `Atue como um veterinário aviário especializado. Analise as imagens anexadas e os seguintes detalhes:
    - Idade da ave: ${birdDetails.age}
    - Linhagem/Raça: ${birdDetails.lineage}
    - Descrição dos sintomas/problema: "${birdDetails.description}"
    
    Tarefa:
    1. Identifique sinais visuais de doenças, deficiências nutricionais ou parasitas.
    2. Forneça um diagnóstico provável baseado nas evidências.
    3. Liste sinais observados especificamente nas imagens.
    4. Recomende passos de primeiros socorros imediatos e isolamento se necessário.
    5. OBRIGATÓRIO: Inclua uma nota enfática de que este é um diagnóstico preliminar por IA e que a consulta com um veterinário presencial é indispensável para tratamento medicamentoso.`
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [...imageParts, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          signsObserved: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          firstAidSteps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          importantNotice: { type: Type.STRING }
        },
        required: ["diagnosis", "signsObserved", "firstAidSteps", "importantNotice"]
      }
    }
  });

  return JSON.parse(response.text) as VetDiagnosis;
};
