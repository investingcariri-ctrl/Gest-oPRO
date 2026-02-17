
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFinancialHealth = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key não configurada.");
  }

  // Filter last 60 days to keep context manageable
  const recentTransactions = transactions.slice(0, 50).map(t => ({
    date: t.date,
    type: t.type,
    amount: t.amount,
    category: t.category,
    status: t.status
  }));

  const prompt = `
    Atue como um tesoureiro sênior especialista em gestão de associações sem fins lucrativos.
    Analise os seguintes dados de transações financeiras recentes.
    
    Dados das Transações:
    ${JSON.stringify(recentTransactions)}
    
    Por favor, forneça uma análise estruturada contendo:
    1. Um resumo executivo da saúde financeira.
    2. Identificação de riscos financeiros (ex: liquidez, dependência de uma fonte de receita, gastos excessivos).
    3. Recomendações estratégicas para melhoria orçamentária e sustentabilidade.
    
    Retorne a resposta estritamente em formato JSON seguindo este esquema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
          },
          required: ["summary", "risks", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      summary: result.summary || "Não foi possível gerar o resumo.",
      risks: result.risks || [],
      recommendations: result.recommendations || [],
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error("Erro ao analisar finanças com Gemini:", error);
    throw error;
  }
};
