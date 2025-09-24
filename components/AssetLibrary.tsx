import React from 'react';
import type { ImageFile } from '../types';
import { TrashIcon } from './icons';

interface AssetLibraryProps {
  assets: ImageFile[];
  onDelete: (assetName: string) => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets, onDelete }) => {
  if (assets.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-6 px-2 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
        Your uploaded assets will appear here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2">
      {assets.map((asset) => (
        <div key={asset.name} className="group relative aspect-square">
          <img src={asset.base64} alt={asset.name} className="w-full h-full rounded-md object-cover border border-slate-200" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-center justify-center">
            <button 
              onClick={() => onDelete(asset.name)} 
              title={`Delete ${asset.name}`} 
              className="p-2 text-white bg-red-600/80 hover:bg-red-500 rounded-full transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
           <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate rounded-b-md">{asset.name}</div>
        </div>
      ))}
    </div>
  );
};