export interface MessagePart {
  text: string;
  image?: string; // base64 data URL
}

export interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
}

export interface ColorPalette {
  name: string;
  colors: string[];
}

export interface ImageFile {
  name: string;
  base64: string;
  mimeType: string;
}

export interface CanvasShape {
    name: string;
    aspectRatio: string;
    systemInstruction: string;
}

export interface SlidePlan {
  slide_number: number;
  visual_description: string;
  text_content: string;
}
