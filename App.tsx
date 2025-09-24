import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Canvas } from './components/Canvas';
import { ChatPanel } from './components/ChatPanel';
import { Toast } from './components/Toast';
import { editImage, getChatResponse, extractPaletteFromImage, generateCarouselPlan } from './services/geminiService';
import type { Message, ColorPalette, ImageFile, CanvasShape, SlidePlan } from './types';
import { PRESET_PALETTES, CANVAS_SHAPES } from './constants';
import { LogoIcon, DownloadIcon, SaveIcon, LoadIcon, NewDesignIcon, MenuIcon, ChatIcon, XIcon } from './components/icons';

const App: React.FC = () => {
  const [logo, setLogo] = useState<ImageFile | null>(null);
  const [assets, setAssets] = useState<ImageFile[]>([]);
  const [colorPalette, setColorPalette] = useState<ColorPalette>(PRESET_PALETTES[0]);
  const [palettes, setPalettes] = useState<ColorPalette[]>(PRESET_PALETTES);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [carouselSlides, setCarouselSlides] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExtractingPalette, setIsExtractingPalette] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasShape, setCanvasShape] = useState<CanvasShape>(CANVAS_SHAPES[0]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        parts: [{ text: "Hello! I'm Nano, your AI graphic designer. To get started, please upload your logo, select a color palette and design type. You can also upload reusable brand assets. Then, tell me what you'd like to create!" }],
      },
    ]);
  }, []);
  
  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => {
            setToast(null);
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);


  const handleSendMessage = useCallback(async (text: string) => {
    setError(null);
    const userMessage: Message = { role: 'user', parts: [{ text }] };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const isCarouselMode = canvasShape.name.toLowerCase().includes('carousel');
      const assetNames = assets.map(a => a.name);
      const fullSystemInstruction = `${canvasShape.systemInstruction} You have the following brand assets available by name: ${assetNames.join(', ')}.`;
      
      if (isCarouselMode) {
        if (!logo && !currentImage) {
            setMessages(prev => [...prev, {role: 'model', parts: [{text: "Please upload a logo or have a design on the canvas to start a carousel."}]}]);
            setIsLoading(false);
            return;
        }
        
        setCarouselSlides([]); // Clear previous slides
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Great idea! Let me plan out the slides for your carousel..." }] }]);
        const plan: SlidePlan[] = await generateCarouselPlan(text);
        
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: `I've planned ${plan.length} slides. Now, let's create them one by one.` }] }]);

        let previousSlideImage = currentImage ?? logo!.base64;
        let previousSlideMimeType = currentImage ? 'image/png' : logo!.mimeType;
        const newSlides: string[] = [];

        for (const slide of plan) {
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Generating slide ${slide.slide_number} of ${plan.length}...` }] }]);
            
            let slidePrompt = `Using a color palette of [${colorPalette.colors.join(', ')}], create this slide based on the plan:
            - Visuals: ${slide.visual_description}
            - Text: "${slide.text_content}"
            Maintain consistency with the previous slide. Don't add any conversational text, just output the edited image.`;

            if (logo) {
              slidePrompt += `\n\nImportant: Ensure the brand logo (provided as an additional image) is included tastefully in the design on every slide.`;
            }
            
            const mentionedAssets = assets.filter(asset => 
                slide.visual_description.toLowerCase().includes(asset.name.toLowerCase()) || 
                slide.visual_description.toLowerCase().includes(asset.name.split('.')[0].toLowerCase())
            );

            const additionalImagesForSlide = [...mentionedAssets];
            if (logo && !additionalImagesForSlide.some(a => a.name === logo.name)) {
              additionalImagesForSlide.push(logo);
            }

            const result = await editImage({
                baseImage: previousSlideImage,
                mimeType: previousSlideMimeType,
                prompt: slidePrompt,
                systemInstruction: fullSystemInstruction,
                additionalImages: additionalImagesForSlide
            });

            if (result.image) {
                const newImage = `data:image/png;base64,${result.image}`;
                newSlides.push(newImage);
                previousSlideImage = newImage;
                previousSlideMimeType = 'image/png';
                
                setCarouselSlides([...newSlides]);
                setCurrentImage(newImage);
            } else {
                 const errorMessage = result.text || `Failed to generate image for slide ${slide.slide_number}. The model did not return an image.`;
                 setMessages(prev => [...prev, { role: 'model', parts: [{ text: errorMessage }] }]);
                 throw new Error(errorMessage);
            }
        }
        
        const modelMessage: Message = { role: 'model', parts: [{ text: "Your carousel is complete! You can click on the previews below to view each slide."}] };
        setMessages(prev => [...prev, modelMessage]);

      } else {
        const isDesignCommand = text.toLowerCase().includes('design') || text.toLowerCase().includes('create') || text.toLowerCase().includes('add') || text.toLowerCase().includes('change') || currentImage;
        if (isDesignCommand && (logo || currentImage)) {
            const baseImage = currentImage ?? logo?.base64;
            const baseMimeType = currentImage ? 'image/png' : logo?.mimeType;

            if (!baseImage || !baseMimeType) {
              throw new Error("A base image (either logo or current design) is required for editing.");
            }
            
            const mentionedAssets = assets.filter(asset => 
                text.toLowerCase().includes(asset.name.toLowerCase()) || 
                text.toLowerCase().includes(asset.name.split('.')[0].toLowerCase())
            );
            
            const fullPrompt = `Using a color palette of [${colorPalette.colors.join(', ')}], and the provided image(s), ${text}. Don't add any conversational text, just output the edited image.`;
            const result = await editImage({
                baseImage: baseImage,
                mimeType: baseMimeType,
                prompt: fullPrompt,
                systemInstruction: fullSystemInstruction,
                additionalImages: mentionedAssets,
            });
            
            let newImage: string | null = null;
            let responseText = "Here is the updated design.";

            if (result.image) {
              newImage = `data:image/png;base64,${result.image}`;
              setCurrentImage(newImage);
            }
            if (result.text) {
              responseText = result.text;
            }

            const modelMessage: Message = { role: 'model', parts: [{ text: responseText, image: newImage ?? undefined }] };
            setMessages(prev => [...prev, modelMessage]);

        } else {
            const chatHistory = [...messages, userMessage];
            const responseText = await getChatResponse(chatHistory, fullSystemInstruction);
            const modelMessage: Message = { role: 'model', parts: [{ text: responseText }] };
            setMessages(prev => [...prev, modelMessage]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const modelMessage: Message = { role: 'model', parts: [{ text: `Sorry, I encountered an error: ${errorMessage}` }] };
      setMessages(prev => [...prev, modelMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [logo, colorPalette, messages, currentImage, canvasShape, assets]);

  const handleLogoUpload = (file: ImageFile) => {
    setLogo(file);
    setCurrentImage(file.base64); 
    setCarouselSlides([]);
    const userMessage: Message = { role: 'user', parts: [{ text: "I've uploaded my logo." }] };
    const modelMessage: Message = { role: 'model', parts: [{ text: "Great! Your logo is loaded. What should we create today?" }] };
    setMessages(prev => [...prev, userMessage, modelMessage]);
  };

  const handleAssetUpload = (file: ImageFile) => {
    if (!assets.some(asset => asset.name === file.name)) {
        setAssets(prev => [...prev, file]);
    }
  };

  const handleAssetDelete = (assetName: string) => {
      setAssets(prev => prev.filter(asset => asset.name !== assetName));
  };

  const handlePaletteChange = (palette: ColorPalette) => {
    setColorPalette(palette);
     const userMessage: Message = { role: 'user', parts: [{ text: `I've selected the '${palette.name}' color palette.` }] };
    const modelMessage: Message = { role: 'model', parts: [{ text: "Excellent color choice! The palette is set." }] };
    setMessages(prev => [...prev, userMessage, modelMessage]);
  };

  const handleShapeChange = (shape: CanvasShape) => {
    setCanvasShape(shape);
    setCarouselSlides([]);
    const userMessage: Message = { role: 'user', parts: [{ text: `I've selected the '${shape.name}' design type.` }] };
    const modelMessage: Message = { role: 'model', parts: [{ text: `Perfect! The canvas is now set for a ${shape.name}.` }] };
    setMessages(prev => [...prev, userMessage, modelMessage]);
  };
  
  const handlePaletteImageUpload = async (file: ImageFile) => {
      setError(null);
      setIsExtractingPalette(true);
      setMessages(prev => [...prev, {role: 'model', parts: [{text: "Analyzing your image to extract a color palette..."}]}]);

      try {
          const colors = await extractPaletteFromImage(file.base64, file.mimeType);
          const newPalette: ColorPalette = {
              name: `Custom - ${file.name}`,
              colors,
          };
          setPalettes(prev => [newPalette, ...prev.filter(p => p.name !== newPalette.name)]);
          setColorPalette(newPalette);
          setMessages(prev => [...prev, {role: 'model', parts: [{text: `I've created a new palette from your image! I've selected it for you.`}]}]);

      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Could not extract palette.';
          setError(errorMessage);
          setMessages(prev => [...prev, {role: 'model', parts: [{text: `Sorry, I couldn't extract a palette from that image. Please try another one.`}]}]);
      } finally {
          setIsExtractingPalette(false);
      }
  };

  const startNewDesign = () => {
    setCurrentImage(logo ? logo.base64 : null);
    setCarouselSlides([]);
    setCanvasShape(CANVAS_SHAPES[0]);
    setColorPalette(palettes[0] || PRESET_PALETTES[0]);
    setMessages(prev => [...prev, {role: 'model', parts: [{text: "Let's start a new design. The canvas has been cleared."}]}]);
  }

  const handleSaveDesign = () => {
    try {
      const messagesToSave = messages.map(msg => ({
        ...msg,
        parts: msg.parts.map(part => ({ text: part.text })), 
      }));

      const designState = {
        logo,
        assets,
        colorPalette,
        currentImage,
        carouselSlides,
        messages: messagesToSave,
        canvasShape,
        palettes,
      };
      localStorage.setItem('aiDesignerState', JSON.stringify(designState));
      setToast({ message: 'Design saved successfully!', type: 'success' });
    } catch (error) {
      console.error("Failed to save design:", error);
      const isQuotaError = error instanceof Error && error.message.toLowerCase().includes('quota');
      setToast({
        message: isQuotaError
          ? 'Failed to save. The design is too large for browser storage.'
          : 'Failed to save design. Storage may be full.',
        type: 'error',
      });
    }
  };

  const handleLoadDesign = () => {
    try {
      const savedStateJSON = localStorage.getItem('aiDesignerState');
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setLogo(savedState.logo || null);
        setAssets(savedState.assets || []);
        setPalettes(savedState.palettes || PRESET_PALETTES);
        setColorPalette(savedState.colorPalette || PRESET_PALETTES[0]);
        setCurrentImage(savedState.currentImage || null);
        setCarouselSlides(savedState.carouselSlides || []);
        setCanvasShape(savedState.canvasShape || CANVAS_SHAPES[0]);
        setMessages(savedState.messages || []);
        setToast({ message: 'Previously saved design loaded!', type: 'success' });
      } else {
        setToast({ message: 'No saved design found.', type: 'error' });
      }
    } catch (error) {
      console.error("Failed to load design:", error);
      setToast({ message: 'Failed to load design. Data may be corrupt.', type: 'error' });
    }
  };
  
  const handleDownloadDesign = () => {
      if (!currentImage) {
          setMessages(prev => [...prev, {role: 'model', parts: [{text: "There is no image to download."}]}]);
          return;
      }
  
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `design-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleSelectSlide = (slide: string) => {
    setCurrentImage(slide);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
             <LogoIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-gray-900 hidden sm:block">AI Graphic Designer</h1>
        </div>
         <div className="flex items-center gap-2">
            <button
                onClick={() => setIsControlsOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-slate-100 lg:hidden"
                title="Open Controls"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => setIsChatOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-slate-100 lg:hidden"
                title="Open Chat"
            >
                <ChatIcon className="w-6 h-6" />
            </button>
            <button 
                onClick={handleDownloadDesign} 
                disabled={!currentImage} 
                title="Download Design" 
                className="flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold transition-colors duration-200 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed">
                <DownloadIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Download</span>
            </button>
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1">
                 <button onClick={handleSaveDesign} title="Save Design" className="p-2 rounded-md text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:bg-white">
                    <SaveIcon className="w-5 h-5" />
                </button>
                <button onClick={handleLoadDesign} title="Load Design" className="p-2 rounded-md text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:bg-white">
                    <LoadIcon className="w-5 h-5" />
                </button>
            </div>
            <button onClick={startNewDesign} title="New Design" className="p-2 rounded-md text-gray-600 hover:text-blue-600 transition-colors duration-200 bg-slate-100 border border-slate-200 hover:bg-white">
                <NewDesignIcon className="w-5 h-5" />
            </button>
        </div>
      </header>
      
      {(isControlsOpen || isChatOpen) && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => {
            setIsControlsOpen(false);
            setIsChatOpen(false);
          }}
        ></div>
      )}

      <main className="flex-grow flex h-[calc(100vh-81px)]">
        {/* Control Panel */}
        <aside className={`w-[380px] flex-shrink-0 bg-white border-r border-slate-200 shadow-lg fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isControlsOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="flex justify-end p-2 lg:hidden">
            <button onClick={() => setIsControlsOpen(false)} className="p-2 text-gray-500 hover:text-gray-800"><XIcon className="w-6 h-6"/></button>
          </div>
          <ControlPanel
            onLogoUpload={handleLogoUpload}
            logoFileName={logo?.name}
            assets={assets}
            onAssetUpload={handleAssetUpload}
            onAssetDelete={handleAssetDelete}
            onShapeChange={handleShapeChange}
            selectedShape={canvasShape}
            onPaletteChange={handlePaletteChange}
            selectedPalette={colorPalette}
            palettes={palettes}
            onPaletteImageUpload={handlePaletteImageUpload}
            isExtractingPalette={isExtractingPalette}
          />
        </aside>

        {/* Canvas */}
        <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 overflow-auto">
          <Canvas 
            image={currentImage} 
            carouselSlides={carouselSlides} 
            aspectRatio={canvasShape.aspectRatio}
            onSelectSlide={handleSelectSlide}
          />
        </div>

        {/* Chat Panel */}
        <aside className={`w-[380px] flex-shrink-0 bg-white border-l border-slate-200 shadow-lg fixed lg:static inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
           <div className="flex justify-start p-2 lg:hidden">
              <button onClick={() => setIsChatOpen(false)} className="p-2 text-gray-500 hover:text-gray-800"><XIcon className="w-6 h-6"/></button>
            </div>
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            error={error}
          />
        </aside>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;