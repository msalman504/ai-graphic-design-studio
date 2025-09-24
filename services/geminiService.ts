import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Message, ImageFile, SlidePlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Function for conversational text
export async function getChatResponse(history: Message[], systemInstruction?: string): Promise<string> {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({ text: part.text }))
      })),
      config: {
          ...(systemInstruction && { systemInstruction }),
      }
    });

    const lastMessage = history[history.length - 1];
    const lastMessageText = lastMessage.parts.map(p => p.text).join(' ');

    const response = await chat.sendMessage({ message: lastMessageText });
    return response.text;
}

// Function for image editing
interface EditImageParams {
  baseImage: string; // base64 string without data URL prefix
  mimeType: string;
  prompt: string;
  systemInstruction?: string;
  additionalImages?: ImageFile[];
}

export async function editImage({ baseImage, mimeType, prompt, systemInstruction, additionalImages = [] }: EditImageParams): Promise<{image: string | null; text: string | null}> {
    const base64Data = baseImage.split(',')[1];

    const imageParts = [
        {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        },
        ...additionalImages.map(img => ({
            inlineData: {
                data: img.base64.split(',')[1],
                mimeType: img.mimeType,
            },
        })),
    ];


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                ...imageParts,
                {
                    text: prompt,
                },
            ],
        },
        config: {
            ...(systemInstruction && { systemInstruction }),
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let resultImage: string | null = null;
    let resultText: string | null = null;
    
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                resultImage = part.inlineData.data;
            } else if (part.text) {
                resultText = part.text;
            }
        }
    }
    
    return { image: resultImage, text: resultText };
}

// Function to extract color palette from an image
export async function extractPaletteFromImage(baseImage: string, mimeType: string): Promise<string[]> {
    const base64Data = baseImage.split(',')[1];
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType,
                    },
                },
                {
                    text: "Extract the 5 most dominant hex color codes from this image. Respond ONLY with a JSON array of strings.",
                },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                }
            }
        }
    });
    
    const jsonStr = response.text.trim();
    const colors = JSON.parse(jsonStr);

    if (!Array.isArray(colors) || colors.length === 0) {
        throw new Error("Failed to extract a valid color palette.");
    }

    return colors;
}

// Function to generate a carousel plan
export async function generateCarouselPlan(prompt: string): Promise<SlidePlan[]> {
    const systemInstruction = `You are a social media expert and content strategist. A user wants to create a carousel post. Your task is to break down their request into a structured plan for a multi-slide carousel. Each slide should have a clear purpose and contribute to a cohesive narrative.

    The user's request is: "${prompt}"

    Generate a JSON array of objects, where each object represents a slide. Each object must have three properties:
    1. "slide_number": An integer for the slide's position (starting from 1).
    2. "visual_description": A detailed instruction for the graphic designer AI on what to create visually for this slide. Be descriptive about layout, imagery, and style.
    3. "text_content": The exact text (headings, body text, etc.) that should appear on the slide. Keep it concise for social media.

    Respond ONLY with the valid JSON array.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemInstruction,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        slide_number: { type: Type.INTEGER },
                        visual_description: { type: Type.STRING },
                        text_content: { type: Type.STRING },
                    },
                    required: ["slide_number", "visual_description", "text_content"],
                }
            }
        }
    });

    const jsonStr = response.text.trim();
    const plan = JSON.parse(jsonStr);

    if (!Array.isArray(plan) || plan.length === 0) {
        throw new Error("Failed to generate a valid carousel plan.");
    }

    return plan;
}
