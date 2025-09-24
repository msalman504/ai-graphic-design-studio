import React from 'react';
import { ImageIcon } from './icons';

interface CanvasProps {
  image: string | null;
  carouselSlides: string[];
  aspectRatio: string;
  onSelectSlide?: (slide: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ image, carouselSlides, aspectRatio, onSelectSlide }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div 
        className="w-full max-w-full bg-slate-200 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border border-slate-300/50 transition-all duration-300 relative group"
        style={{ aspectRatio: aspectRatio }}
        >
        {image ? (
          <img src={image} alt="Generated design" className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="text-center text-gray-500 flex flex-col items-center p-8">
            <div className="p-4 bg-slate-300/50 rounded-full mb-4 border border-slate-300">
                <ImageIcon className="w-12 h-12 text-slate-500" />
            </div>
            <p className="font-semibold text-lg text-slate-600">Your Design Canvas</p>
            <p className="text-sm">Your generated image will appear here.</p>
          </div>
        )}
      </div>
      {carouselSlides.length > 0 && (
        <div className="w-full">
          <h3 className="text-sm font-semibold mb-3 text-gray-500 tracking-wider">Carousel Slides</h3>
          <div className="flex gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            {carouselSlides.map((slide, index) => (
              <div 
                key={index} 
                onClick={() => onSelectSlide && onSelectSlide(slide)}
                className={`w-24 h-24 flex-shrink-0 border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${slide === image ? 'border-blue-500 scale-105' : 'border-slate-300 hover:border-slate-400'}`}>
                 <img src={slide} alt={`Carousel slide ${index + 1}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
