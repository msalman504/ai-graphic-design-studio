import React from 'react';
import type { ColorPalette } from '../types';

interface ColorPalettePickerProps {
  palettes: ColorPalette[];
  selected: ColorPalette;
  onSelect: (palette: ColorPalette) => void;
}

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({ palettes, selected, onSelect }) => {
  return (
    <div className="space-y-3">
      {palettes.map((palette) => (
        <div
          key={palette.name}
          onClick={() => onSelect(palette)}
          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${selected.name === palette.name ? 'ring-2 ring-offset-2 ring-offset-white ring-blue-500 bg-slate-50 border-slate-200' : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'}`}
        >
          <p className="font-semibold text-sm mb-2 text-gray-700">{palette.name}</p>
          <div className="flex space-x-2">
            {palette.colors.map((color) => (
              <div
                key={color}
                className="w-6 h-6 rounded-full shadow-sm border border-black/10 flex-grow"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};