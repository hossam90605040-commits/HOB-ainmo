import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Attachment } from "../types";

// Always use process.env.GEMINI_API_KEY
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const MODELS = {
  FAST: 'gemini-3-flash-preview',
  SMART: 'gemini-3.1-pro-preview',
  IMAGE: 'gemini-2.5-flash-image',
  VIDEO: 'gemini-3-flash-preview',
  THINKING: 'gemini-3-flash-preview'
};

export async function* sendMessageStream(
  message: string,
  history: ChatMessage[] = [],
  modelName: string = MODELS.FAST,
  attachments: Attachment[] = []
) {
  const result = await genAI.models.generateContentStream({
    model: modelName,
    contents: [
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [
          { text: m.content },
          ...(m.attachments?.map(a => ({
            inlineData: {
              mimeType: a.type,
              data: a.url.includes('base64,') ? a.url.split('base64,')[1] : a.url
            }
          })) || [])
        ]
      })),
      { 
        role: 'user', 
        parts: [
          { text: message },
          ...(attachments.map(a => ({
            inlineData: {
              mimeType: a.type,
              data: a.url.includes('base64,') ? a.url.split('base64,')[1] : a.url
            }
          })))
        ] 
      }
    ],
    config: {
      temperature: 0.7,
      topP: 0.95,
      systemInstruction: "You are HOB AI, a premium Arabic-first AI assistant. You are intelligent, helpful, and eloquent in both Arabic and English. Your preferred language is Arabic. Use professional and modern Arabic. Format your code in markdown blocks. You have access to Google Search to provide accurate, real-time information. Always verify facts using the search tool when needed, and your response will automatically include citations for the sources you used.",
      tools: [{ googleSearch: {} }],
    }
  });

  let fullText = "";
  let groundingMetadata: any = null;

  for await (const chunk of result) {
    if (chunk.text) {
      fullText += chunk.text;
      yield chunk.text;
    }
    
    // Attempt to capture grounding metadata if available in the last chunk
    const candidate = chunk.candidates?.[0];
    if (candidate?.groundingMetadata) {
      groundingMetadata = candidate.groundingMetadata;
    }
  }

  // If we have grounding metadata, append sources at the end
  if (groundingMetadata?.searchEntryPoint?.html) {
    // This is the Google Search widget
    // But we also want specific links if available
  }

  if (groundingMetadata?.groundingChunks) {
    const sources = groundingMetadata.groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || chunk.web.uri,
        url: chunk.web.uri
      }));

    if (sources.length > 0) {
      const uniqueSources = Array.from(new Set(sources.map((s: any) => s.url)))
        .map(url => sources.find((s: any) => s.url === url));

      const sourcesText = "\n\n---\n**المصادر:**\n" + 
        uniqueSources.map((s: any, i: number) => `[${i + 1}] [${s.title}](${s.url})`).join('\n');
      
      yield sourcesText;
    }
  }
}

export async function generateImageAI(prompt: string) {
  const result = await genAI.models.generateContent({
    model: MODELS.IMAGE,
    contents: [{ text: prompt }]
  });

  const parts = result.candidates[0].content.parts;
  const imagePart = parts.find(p => p.inlineData);
  if (imagePart?.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
  throw new Error("No image generated");
}

export async function generateVideoAI(prompt: string, attachments: Attachment[] = []) {
  // Simulating animation logic: if image is provided, we animate it.
  const hasImage = attachments.some(a => a.type.startsWith('image/'));
  
  // In a real implementation with a supporting API, this would return a video URL
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  if (hasImage) {
    // Return a dummy animated result
    return "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";
  }
  
  return "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"; 
}
