import React, { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { Button } from './components/Button';
import { PixelatedPreview } from './components/PixelatedPreview';
import { AnimatedResult } from './components/AnimatedResult';
import { transformImage } from './services/imageProcessor';
import { ProcessingState, PixelMove } from './types';

function App() {
  const [subjectImage, setSubjectImage] = useState<string | null>(null);
  const [objectImage, setObjectImage] = useState<string | null>(null);
  
  // Outputs
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [pixSubject, setPixSubject] = useState<string | null>(null);
  const [pixObject, setPixObject] = useState<string | null>(null);
  const [pixelMoves, setPixelMoves] = useState<PixelMove[] | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | null>(null);
  
  const [blockSize, setBlockSize] = useState<number>(8);
  const [status, setStatus] = useState<ProcessingState>(ProcessingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpload = (file: File, type: 'subject' | 'object') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        if (type === 'subject') setSubjectImage(e.target.result);
        else setObjectImage(e.target.result);
        
        // Reset results when inputs change
        setResultImage(null);
        setPixSubject(null);
        setPixObject(null);
        setPixelMoves(null);
        setDimensions(null);
        setStatus(ProcessingState.IDLE);
      }
    };
    reader.readAsDataURL(file);
  };

  const process = async () => {
    if (!subjectImage || !objectImage) return;

    setStatus(ProcessingState.PROCESSING);
    setErrorMsg(null);

    // Give UI a moment to update to loading state before blocking thread
    setTimeout(async () => {
      try {
        // Client-side pixel processing
        const output = await transformImage(subjectImage, objectImage, {
          blockSize,
          maxDimension: 800, // Limit processing to reasonable size
          onProgress: (progress) => {
            // Could add progress indicator here if needed
            console.log(`Processing: ${progress}%`);
          }
        });
        
        setPixSubject(output.pixelatedSubject);
        setPixObject(output.pixelatedObject);
        setResultImage(output.result);
        setPixelMoves(output.moves);
        setDimensions({ width: output.width, height: output.height });
        
        setStatus(ProcessingState.COMPLETED);

      } catch (err) {
        console.error(err);
        setStatus(ProcessingState.ERROR);
        setErrorMsg("An error occurred while processing the images.");
      }
    }, 100);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `transformed-pixel-structure-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">P</div>
            <h1 className="text-xl font-bold tracking-tight text-white">Pixel Structure Transformer</h1>
          </div>
          <div className="text-sm text-zinc-500 hidden sm:block">
            Rearrange Object pixels to match Subject structure
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Controls Section */}
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            <div className="flex-1 w-full">
              <label htmlFor="blockSize" className="block text-sm font-medium text-zinc-300 mb-2">
                Pixel Block Size: <span className="text-indigo-400 font-mono">{blockSize}px</span>
              </label>
              <input
                id="blockSize"
                type="range"
                min="1"
                max="50"
                step="1"
                value={blockSize}
                onChange={(e) => setBlockSize(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Smaller values = finer detail. Larger values = abstract.
              </p>
            </div>

            <div className="flex-none w-full md:w-auto">
               <Button 
                onClick={process}
                disabled={!subjectImage || !objectImage}
                isLoading={status === ProcessingState.PROCESSING}
                className="w-full md:w-48 shadow-lg shadow-indigo-900/20"
              >
                Generate
              </Button>
            </div>
          </div>
          
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800/50 rounded text-red-300 text-sm">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex-1 min-h-[300px] bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
              <ImageUpload
                label="Subject Image"
                description="Provides the structure & lighting"
                imageSrc={subjectImage}
                onUpload={(f) => handleUpload(f, 'subject')}
              />
            </div>
            
            <div className="flex-1 min-h-[300px] bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
              <ImageUpload
                label="Object Image"
                description="Provides the colors/palette"
                imageSrc={objectImage}
                onUpload={(f) => handleUpload(f, 'object')}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:flex lg:col-span-1 items-center justify-center relative">
             <div className="h-full w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent absolute left-1/2 -translate-x-1/2"></div>
          </div>

          {/* Output Column */}
          <div className="lg:col-span-6 flex flex-col gap-6">
             <div className="min-h-[500px]">
               {(pixelMoves && dimensions) ? (
                 <AnimatedResult 
                   moves={pixelMoves} 
                   width={dimensions.width} 
                   height={dimensions.height}
                 />
               ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="text-lg font-medium text-zinc-500">Result</h3>
                    </div>
                    <div className="relative flex-1 bg-black rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center">
                       <div className="text-center p-8">
                          <p className="text-zinc-500">Upload images and generate to see the transformation.</p>
                       </div>
                    </div>
                  </div>
               )}
             </div>
             
             {/* Download Button */}
             {resultImage && (
                <div className="flex justify-end">
                   <Button onClick={handleDownload} className="w-full sm:w-auto">
                     Download High-Res Image
                   </Button>
                </div>
             )}
             
             {/* Intermediate Steps Display */}
             {(pixSubject && pixObject) && (
               <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                  <h3 className="text-zinc-100 font-medium mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Intermediate Processing Steps
                  </h3>
                  <PixelatedPreview subjectSrc={pixSubject} objectSrc={pixObject} />
                  <p className="mt-3 text-xs text-zinc-500">
                    Strict pixel rearrangement from source to target.
                  </p>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
