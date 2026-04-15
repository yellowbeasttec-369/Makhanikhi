import React, { useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Camera, X, Check, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  title?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, title = "Capture Evidence" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = async () => {
    setIsStarting(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
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
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-technic-yellow">{title}</h3>
          <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden">
          {!capturedImage ? (
            <>
              {isStarting && <Loader2 className="w-8 h-8 text-technic-yellow animate-spin" />}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <Button 
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-technic-yellow/50 hover:bg-technic-yellow transition-all flex items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-industrial-charcoal" />
                </Button>
              </div>
            </>
          ) : (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-6 flex gap-4">
          {capturedImage ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1 border-white/10 hover:bg-white/5 font-bold uppercase text-xs tracking-widest"
                onClick={handleRetake}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Retake
              </Button>
              <Button 
                className="flex-1 bg-technic-yellow text-industrial-charcoal font-black uppercase text-xs tracking-widest"
                onClick={handleConfirm}
              >
                <Check className="w-4 h-4 mr-2" /> Use Photo
              </Button>
            </>
          ) : (
            <p className="text-[10px] text-text-dim text-center w-full uppercase tracking-widest">
              Align evidence in the frame and capture
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
