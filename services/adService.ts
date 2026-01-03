
import { GoogleGenAI } from "@google/genai";

export const generateEggAd = async (eggType: string): Promise<string> => {
  // Use strictly process.env.API_KEY and named parameter for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Atue como um redator publicitário focado em produtos da roça. 
    Crie um anúncio de venda para meus ovos de tipo: ${eggType}. 
    O anúncio deve ser curto, para ser postado no status do WhatsApp e grupos de vizinhos. 
    Destaque que os ovos são frescos, colhidos hoje e criados de forma ética. 
    Use gatilhos mentais de saúde, sabor de infância e urgência (estoque limitado). 
    Inclua emojis adequados ao tema rural. 
    Retorne apenas o texto do anúncio pronto para copiar.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "Erro ao gerar anúncio.";
};