import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Download, Loader2 } from 'lucide-react';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBgColor, setSelectedBgColor] = useState('transparent');
  const [customBgImage, setCustomBgImage] = useState(null);
  const [mergedImage, setMergedImage] = useState(null);

  useEffect(() => {
    if (!processedImage) {
      setMergedImage(null);
      return;
    }

    const generateMergedImage = async () => {
      if (selectedBgColor === 'transparent' && !customBgImage) {
        setMergedImage(processedImage);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const fgImg = new window.Image();
      fgImg.crossOrigin = 'anonymous';
      fgImg.src = processedImage;
      
      try {
        await new Promise((resolve, reject) => {
          fgImg.onload = resolve;
          fgImg.onerror = reject;
        });

        canvas.width = fgImg.width;
        canvas.height = fgImg.height;

        if (customBgImage) {
          const bgImg = new window.Image();
          bgImg.crossOrigin = 'anonymous';
          bgImg.src = customBgImage;
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = reject;
          });
          
          const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
          const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
          const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
          ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        } else if (selectedBgColor && selectedBgColor !== 'transparent') {
          ctx.fillStyle = selectedBgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(fgImg, 0, 0);
        setMergedImage(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error("Error generating merged image:", err);
        setMergedImage(processedImage);
      }
    };

    generateMergedImage();
  }, [processedImage, selectedBgColor, customBgImage]);

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
    const imageToDownload = mergedImage || processedImage;
    if (!imageToDownload) return;
    
    try {
      let url;
      let isDataUrl = imageToDownload.startsWith('data:');
      
      if (isDataUrl) {
        url = imageToDownload;
      } else {
        const response = await fetch(imageToDownload);
        const blob = await response.blob();
        url = window.URL.createObjectURL(blob);
      }
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `clearcut-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      
      if (!isDataUrl) {
        window.URL.revokeObjectURL(url);
      }
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
    setSelectedBgColor('transparent');
    setCustomBgImage(null);
    setMergedImage(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* Upload Section */}
      {!preview && (
        <div
          className={`glass-panel rounded-3xl p-10 md:p-20 text-center cursor-pointer transition-all duration-300 ease-out border-2 border-dashed ${
            isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-slate-300 dark:border-slate-600 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/80'
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
          
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">
            Drag & Drop your image here
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 transition-colors">
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
        <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 transition-colors">
          <X className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl transition-colors duration-300">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-slate-800 dark:text-white font-medium truncate max-w-[200px] sm:max-w-xs transition-colors">{file.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            
            <button 
              onClick={clearSelection}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Original Image */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 transition-colors"></span>
                Original Image
              </h4>
              <div className="glass-panel rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center relative group">
                <img src={preview} alt="Original" className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            {/* Processed Image */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Background Removed
              </h4>
              <div className="rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center relative checkerboard border border-slate-200 dark:border-slate-700/50 shadow-inner transition-colors duration-300">
                
                {!processedImage && !isProcessing && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
                    <p className="text-slate-700 dark:text-slate-300 mb-6 max-w-sm transition-colors">Ready to work magic on your image. Click the button below to remove the background.</p>
                    <button
                      onClick={processImage}
                      className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transform hover:-translate-y-1"
                    >
                      Remove Background
                    </button>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-primary font-medium animate-pulse">Cutting out the background...</p>
                  </div>
                )}

                {processedImage && (
                  <img src={mergedImage || processedImage} alt="Processed" className="max-w-full max-h-full object-contain animate-in fade-in duration-700" />
                )}
              </div>
            </div>
          </div>

          {/* Background Replacement Tools */}
          {processedImage && (
            <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 animate-in slide-in-from-bottom-4 duration-500 transition-colors duration-300">
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 transition-colors">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Background Replacement
              </h4>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Transparent option */}
                <button
                  onClick={() => { setSelectedBgColor('transparent'); setCustomBgImage(null); }}
                  className={`w-10 h-10 rounded-full border-2 checkerboard flex items-center justify-center transition-all ${
                    selectedBgColor === 'transparent' && !customBgImage ? 'border-primary scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-400'
                  }`}
                  title="Transparent Background"
                />
                
                {/* Solid Colors */}
                {[
                  { name: 'White', color: '#FFFFFF' },
                  { name: 'Black', color: '#000000' },
                  { name: 'Blue', color: '#3B82F6' },
                  { name: 'Red', color: '#EF4444' },
                  { name: 'Green', color: '#22C55E' },
                ].map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => { setSelectedBgColor(bg.color); setCustomBgImage(null); }}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedBgColor === bg.color && !customBgImage ? 'border-primary scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: bg.color }}
                    title={`${bg.name} Background`}
                  />
                ))}
                
                {/* Custom Image Upload */}
                <div className="ml-auto flex-shrink-0 mt-4 sm:mt-0 w-full sm:w-auto flex justify-end">
                  <input
                    type="file"
                    id="custom-bg-upload"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCustomBgImage(URL.createObjectURL(file));
                        setSelectedBgColor(null);
                      }
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('custom-bg-upload').click()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border-2 ${
                      customBgImage ? 'bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Custom Image
                  </button>
                </div>
              </div>
            </div>
          )}

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
