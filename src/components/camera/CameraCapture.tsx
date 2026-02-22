'use client';

import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  label?: string;
}

export function CameraCapture({ onCapture, label = 'Prendre une photo' }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      alert('Impossible d\'accéder à la caméra');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            onCapture(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div className="space-y-4">
      {!showCamera ? (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-2 rounded-md bg-[var(--color-moss)] px-4 py-2 text-white hover:opacity-90"
          >
            <Camera className="h-5 w-5" />
            {label}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            <Upload className="h-5 w-5" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 rounded-md bg-[var(--color-moss)] px-4 py-2 text-white hover:opacity-90"
            >
              Capturer
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
