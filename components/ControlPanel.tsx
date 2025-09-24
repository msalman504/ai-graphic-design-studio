import React from 'react';
import type { ColorPalette, ImageFile, CanvasShape } from '../types';
import { CANVAS_SHAPES } from '../constants';
import { ColorPalettePicker } from './ColorPalettePicker';
import { ImageUploader } from './ImageUploader';
import { AssetLibrary } from './AssetLibrary';
import { SquareIcon, SmartphoneIcon, FileTextIcon, MonitorIcon, CarouselIcon } from './icons';

const shapeIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  'Social Post (Square)': SquareIcon,
  'Social Story (Portrait)': SmartphoneIcon,
  'Flyer (Portrait)': FileTextIcon,
  'Web Banner (Landscape)': MonitorIcon,
  'Social Carousel (Square)': CarouselIcon,
};

const DesignTypeButton: React.FC<{shape: CanvasShape, selected: boolean, onClick: () => void}> = ({shape, selected, onClick}) => {
  const Icon = shapeIcons[shape.name];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 border-2 ${
        selected
          ? 'bg-blue-500/10 border-blue-500 text-blue-600'
          : 'bg-slate-100 border-slate-200 text-gray-500 hover:border-slate-400 hover:text-gray-700'
      }`}
    >
      {Icon && <Icon className="w-6 h-6" />}
      <span className="text-xs font-semibold tracking-wide text-center">{shape.name}</span>
    </button>
  );
};


interface ControlPanelProps {
  onLogoUpload: (file: ImageFile) => void;
  logoFileName?: string;
  assets: ImageFile[];
  onAssetUpload: (file: ImageFile) => void;
  onAssetDelete: (assetName: string) => void;
  onPaletteChange: (palette: ColorPalette) => void;
  selectedPalette: ColorPalette;
  onShapeChange: (shape: CanvasShape) => void;
  selectedShape: CanvasShape;
  onPaletteImageUpload: (file: ImageFile) => void;
  isExtractingPalette: boolean;
  palettes: ColorPalette[];
}

const ControlSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 tracking-wide">{title}</h2>
        {children}
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onLogoUpload,
  logoFileName,
  assets,
  onAssetUpload,
  onAssetDelete,
  onPaletteChange,
  selectedPalette,
  onShapeChange,
  selectedShape,
  onPaletteImageUpload,
  isExtractingPalette,
  palettes,
}) => {
  const handlePaletteFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onPaletteImageUpload({ name: file.name, base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };


  return (
    <div className="flex flex-col gap-6 h-full p-4 overflow-y-auto">
      <ControlSection title="1. Your Logo">
        <ImageUploader onImageUpload={onLogoUpload} uploadedFileName={logoFileName} />
      </ControlSection>

      <ControlSection title="2. Brand Assets">
        <div className="space-y-4">
          <ImageUploader onImageUpload={onAssetUpload} buttonText="Upload Asset" />
          <AssetLibrary assets={assets} onDelete={onAssetDelete} />
        </div>
      </ControlSection>
      
       <ControlSection title="3. Design Type">
         <div className="grid grid-cols-2 gap-3">
            {CANVAS_SHAPES.map(shape => (
                <DesignTypeButton
                    key={shape.name}
                    shape={shape}
                    selected={selectedShape.name === shape.name}
                    onClick={() => onShapeChange(shape)}
                />
            ))}
         </div>
      </ControlSection>

      <ControlSection title="4. Color Palette">
         <label htmlFor="palette-upload" className={`w-full text-center p-3 rounded-lg mb-4 block transition-colors text-sm font-semibold ${isExtractingPalette ? 'bg-slate-200 text-gray-500 cursor-wait' : 'bg-slate-100 hover:bg-slate-200 cursor-pointer text-gray-700'}`}>
            {isExtractingPalette ? 'Extracting Colors...' : '🎨 Create Palette from Image'}
        </label>
        <input id="palette-upload" type="file" className="hidden" accept="image/*" onChange={handlePaletteFileChange} disabled={isExtractingPalette} />
        
        <ColorPalettePicker
          palettes={palettes}
          selected={selectedPalette}
          onSelect={onPaletteChange}
        />
      </ControlSection>
    </div>
  );
};
