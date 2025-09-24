import type { ColorPalette, CanvasShape } from './types';

export const PRESET_PALETTES: ColorPalette[] = [
  { name: 'Vibrant', colors: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'] },
  { name: 'Corporate', colors: ['#0D3B66', '#FAF0CA', '#F4D35E', '#EE964B', '#F95738'] },
  { name: 'Pastel', colors: ['#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94'] },
  { name: 'Monochrome', colors: ['#222222', '#444444', '#666666', '#999999', '#CCCCCC'] },
  { name: 'Ocean', colors: ['#00A7E1', '#007EA7', '#003459', '#F0F0F0', '#FFFFFF'] },
  { name: 'Sunset', colors: ['#FAD02C', '#F7934C', '#CC444B', '#8B2635', '#4B1D3F'] },
];

export const CANVAS_SHAPES: CanvasShape[] = [
    {
        name: 'Social Post (Square)',
        aspectRatio: '1 / 1',
        systemInstruction: 'You are a graphic designer creating a visually engaging square social media post (1:1 aspect ratio). The design should be bold, eye-catching, and optimized for platforms like Instagram. Text should be minimal and legible.'
    },
    {
        name: 'Social Story (Portrait)',
        aspectRatio: '9 / 16',
        systemInstruction: 'You are a graphic designer creating a vertical social media story (9:16 aspect ratio). The design must fill the screen and be suitable for Instagram Stories or TikTok. Consider space for interactive elements at the top and bottom.'
    },
    {
        name: 'Flyer (Portrait)',
        aspectRatio: '1 / 1.414', // A4 paper aspect ratio
        systemInstruction: 'You are a graphic designer creating a professional A4-style portrait flyer. The layout should be well-structured with clear headings, body text, and a call-to-action. It needs to be suitable for printing.'
    },
     {
        name: 'Web Banner (Landscape)',
        aspectRatio: '16 / 9',
        systemInstruction: 'You are a graphic designer creating a wide landscape banner for a website (16:9 aspect ratio). The design should be clean, impactful, and guide the user\'s eye towards a key message or button.'
    },
    {
        name: 'Social Carousel (Square)',
        aspectRatio: '1 / 1',
        systemInstruction: 'You are a graphic designer creating a slide for a social media carousel (1:1 aspect ratio). You will be given instructions for a single slide, and the previous slide as context. Maintain a consistent visual style (fonts, colors, layout) with the previous slide. The design should be clean, engaging, and part of a cohesive multi-slide story.'
    }
];
