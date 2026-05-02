import React, { useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Camera, X, Check, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  title?: string;
  mode?: 'document' | 'part' | 'evidence';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onCapture, 
  onClose, 
  title = "Capture Evidence",
  mode = 'evidence'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = async () => {
    setIsStarting(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Use higher resolution for documents
      const displayWidth = video.videoWidth;
      const displayHeight = video.videoHeight;
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-industrial-charcoal flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-card-bg">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-technic-yellow animate-pulse" />
             <h3 className="text-sm font-bold uppercase tracking-widest text-technic-yellow">{title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }} className="h-8 w-8 text-text-dim hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
          {!capturedImage ? (
            <>
              {isStarting && <Loader2 className="w-8 h-8 text-technic-yellow animate-spin" />}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {/* Scan Overlay Guides */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 {mode === 'document' ? (
                   <div className="w-[85%] h-[85%] border-2 border-white/30 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-technic-yellow rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-technic-yellow rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-technic-yellow rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-technic-yellow rounded-br-lg" />
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-technic-yellow/20 animate-scan" />
                   </div>
                 ) : (
                   <div className="w-full h-full p-12">
                      <div className="w-full h-full border border-white/20 rounded-full border-dashed" />
                   </div>
                 )}
              </div>

              <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-4">
                <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                   <p className="text-[9px] font-black uppercase tracking-[3px] text-digital-white">
                     {mode === 'document' ? 'Align Receipt / ID' : 'Focus on Part / Evidence'}
                   </p>
                </div>
                <Button 
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full bg-white border-8 border-technic-yellow/30 hover:bg-technic-yellow transition-all flex items-center justify-center group"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-industrial-charcoal group-active:scale-95 transition-transform" />
                </Button>
              </div>
            </>
          ) : (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-6 bg-card-bg flex gap-4">
          {capturedImage ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1 border-white/10 hover:bg-white/5 font-bold uppercase text-xs tracking-widest h-12"
                onClick={handleRetake}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Retake
              </Button>
              <Button 
                className="flex-1 bg-technic-yellow text-industrial-charcoal font-black uppercase text-xs tracking-widest h-12"
                onClick={handleConfirm}
              >
                <Check className="w-4 h-4 mr-2" /> Use Photo
              </Button>
            </>
          ) : (
             <div className="w-full flex justify-around">
               <div className="flex flex-col items-center gap-1 opacity-50">
                  <div className={`w-1 h-1 rounded-full ${mode === 'evidence' ? 'bg-technic-yellow' : 'bg-transparent'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">General</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <div className={`w-1 h-1 rounded-full ${mode === 'document' ? 'bg-technic-yellow' : 'bg-transparent'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-technic-yellow italic underline">Document Mode</span>
               </div>
               <div className="flex flex-col items-center gap-1 opacity-50">
                  <div className={`w-1 h-1 rounded-full ${mode === 'part' ? 'bg-technic-yellow' : 'bg-transparent'}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Macro</span>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
