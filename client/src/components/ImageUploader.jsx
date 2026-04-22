import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Download, Loader2 } from 'lucide-react';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
      setError('Only JPG, JPEG, and PNG files are allowed.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setProcessedImage(null);
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const processImage = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/remove-background`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      setProcessedImage(data.processedUrl);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!processedImage) return;
    
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clearcut-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image.');
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* Upload Section */}
      {!preview && (
        <div
          className={`glass-panel rounded-3xl p-10 md:p-20 text-center cursor-pointer transition-all duration-300 ease-out border-2 border-dashed ${
            isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-slate-600 hover:border-primary/50 hover:bg-slate-800/80'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
          
          <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">
            Drag & Drop your image here
          </h3>
          <p className="text-slate-400 mb-6">
            or click to browse from your device
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4"/> PNG, JPG</span>
            <span>•</span>
            <span>Up to 10MB</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <X className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="bg-slate-700 p-3 rounded-xl">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                <p className="text-sm text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            
            <button 
              onClick={clearSelection}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Original Image */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                Original Image
              </h4>
              <div className="glass-panel rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center relative group">
                <img src={preview} alt="Original" className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            {/* Processed Image */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Background Removed
              </h4>
              <div className="rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center relative checkerboard border border-slate-700/50 shadow-inner">
                
                {!processedImage && !isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-slate-300 mb-6 max-w-sm">Ready to work magic on your image. Click the button below to remove the background.</p>
                    <button
                      onClick={processImage}
                      className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transform hover:-translate-y-1"
                    >
                      Remove Background
                    </button>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-primary font-medium animate-pulse">Cutting out the background...</p>
                  </div>
                )}

                {processedImage && (
                  <img src={processedImage} alt="Processed" className="max-w-full max-h-full object-contain animate-in fade-in duration-700" />
                )}
              </div>
            </div>
          </div>

          {/* Download Action */}
          {processedImage && (
            <div className="flex justify-center mt-12 animate-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={handleDownload}
                className="group flex items-center gap-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-secondary hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transform hover:-translate-y-1"
              >
                <Download className="w-6 h-6 group-hover:animate-bounce" />
                Download HD Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
