import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Attachment } from "../types";

// Always use process.env.GEMINI_API_KEY
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const MODELS = {
  FAST: 'gemini-3-flash-preview',
  SMART: 'gemini-3.1-pro-preview',
  IMAGE: 'gemini-2.5-flash-image',
  VIDEO: 'veo-3.1-lite-generate-preview',
  THINKING: 'gemini-3.1-pro-preview'
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

  let groundingMetadata: any = null;

  for await (const chunk of result) {
    if (chunk.text) {
      yield chunk.text;
    }
    
    const candidate = chunk.candidates?.[0];
    if (candidate?.groundingMetadata) {
      groundingMetadata = candidate.groundingMetadata;
    }
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

export async function generateImageAI(prompt: string): Promise<string> {
  try {
    const response = await genAI.models.generateContent({
      model: MODELS.IMAGE,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" },
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("لم يتم إرجاع أي نتائج من النموذج. قد يكون السبب فلاتر الأمان.");
    }

    const firstCandidate = response.candidates[0];
    if (!firstCandidate.content || !firstCandidate.content.parts) {
      throw new Error("الاستجابة فارغة أو غير مكتملة.");
    }

    for (const part of firstCandidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("لم يتم العثور على بيانات الصورة في الاستجابة.");
  } catch (error: any) {
    console.error("AI Image Generation Error:", error);
    throw error;
  }
}

export async function generateVideoAI(prompt: string, attachments: Attachment[] = []): Promise<string> {
  try {
    const imagePart = attachments.find(a => a.type.startsWith('image/'));
    
    let operation = await genAI.models.generateVideos({
      model: MODELS.VIDEO,
      prompt: prompt,
      ...(imagePart && {
        image: {
          imageBytes: imagePart.url.includes('base64,') ? imagePart.url.split('base64,')[1] : imagePart.url,
          mimeType: imagePart.type
        }
      }),
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await genAI.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("لم يتم العثور على رابط تحميل الفيديو في الاستجابة.");
    }

    const apiKey = (process.env as any).API_KEY || process.env.GEMINI_API_KEY!;
    
    const fetchResponse = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(`فشل في تحميل الفيديو: ${fetchResponse.statusText}`);
    }

    const blob = await fetchResponse.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("AI Video Generation Error:", error);
    if (error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED')) {
      throw new Error("توليد الفيديو يتطلب مفتاح API مدفوع ومفعل عليه خدمة Veo. يرجى التأكد من إعداداتك.");
    }
    throw error;
  }
}
