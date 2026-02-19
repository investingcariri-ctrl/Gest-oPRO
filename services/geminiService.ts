
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIAnalysisResult } from "../types";

export const analyzeFinancialHealth = async (transactions: Transaction[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Pega as últimas 30 transações para análise de tendência rápida
  const recentTransactions = transactions.slice(0, 30).map(t => ({
    d: t.date,
    ty: t.type,
    v: t.amount,
    c: t.category,
    s: t.status
  }));

  const prompt = `
    Como consultor financeiro sênior, analise este fluxo de caixa de uma associação.
    Dê um resumo, identifique 3 riscos e sugira 3 recomendações.
    
    Dados: ${JSON.stringify(recentTransactions)}
    
    Responda em JSON com os campos: summary (string), risks (array de strings), recommendations (array de strings).
  `;

  try {
    // gemini-3-flash-preview é otimizado para tarefas de análise rápida
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "risks", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      summary: result.summary || "Análise indisponível no momento.",
      risks: result.risks || [],
      recommendations: result.recommendations || [],
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error("Erro na análise IA:", error);
    throw error;
  }
};
