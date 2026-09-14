import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Sparkles, 
  X, 
  FileCheck, 
  Sliders, 
  Film, 
  Layers, 
  RefreshCw,
  Play
} from 'lucide-react';
import { MediaType, PromptStyle } from '../types';
import { SAMPLE_IMAGES, svgToDataUrl } from '../data/sampleMedia';
import { fileToBase64, formatFileSize, createCinematicSampleVideo } from '../utils/mediaUtils';

interface MediaUploaderProps {
  mediaType: MediaType;
  onChangeMediaType: (type: MediaType) => void;
  selectedFile: {
    file?: File;
    previewUrl: string;
    dataBase64: string;
    mimeType: string;
    name: string;
    size: number;
  } | null;
  onSelectMedia: (media: {
    file?: File;
    previewUrl: string;
    dataBase64: string;
    mimeType: string;
    name: string;
    size: number;
  } | null) => void;
  promptStyle: PromptStyle;
  onChangePromptStyle: (style: PromptStyle) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  language: 'en' | 'km';
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  mediaType,
  onChangeMediaType,
  selectedFile,
  onSelectMedia,
  promptStyle,
  onChangePromptStyle,
  onGenerate,
  isGenerating,
  language,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const isKm = language === 'km';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    try {
      const dataUrl = await fileToBase64(file);
      const isVideoFile = file.type.startsWith('video/');
      
      // Auto-switch mode if user uploads opposite file
      if (isVideoFile && mediaType !== 'video') {
        onChangeMediaType('video');
      } else if (!isVideoFile && mediaType !== 'image') {
        onChangeMediaType('image');
      }

      onSelectMedia({
        file,
        previewUrl: dataUrl,
        dataBase64: dataUrl,
        mimeType: file.type || (isVideoFile ? 'video/mp4' : 'image/jpeg'),
        name: file.name,
        size: file.size,
      });
    } catch (err) {
      console.error('Failed to read file', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const loadSampleImage = (sample: typeof SAMPLE_IMAGES[0]) => {
    const dataUrl = svgToDataUrl(sample.svgData);
    onSelectMedia({
      previewUrl: dataUrl,
      dataBase64: dataUrl,
      mimeType: 'image/svg+xml',
      name: `${sample.title}.svg`,
      size: sample.svgData.length,
    });
  };

  const loadSampleVideo = async (theme: 'drone_landscape' | 'cyberpunk_tunnel') => {
    try {
      setSampleLoading(true);
      const { dataUrl, mimeType } = await createCinematicSampleVideo(theme);
      onSelectMedia({
        previewUrl: dataUrl,
        dataBase64: dataUrl,
        mimeType: mimeType,
        name: theme === 'drone_landscape' ? 'drone-sunset-cinematic.webm' : 'cyberpunk-tunnel.webm',
        size: 240000,
      });
    } catch (err) {
      console.error('Failed to create sample video', err);
    } finally {
      setSampleLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* 1. Menu: Image= Analyze image to prompt text, Video= Transcribe video content into descriptive prompts */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          {isKm ? 'ជ្រើសរើសម៉ឺនុយដំណើរការ (Menu)' : 'Processing Mode (Menu)'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Image Mode Button */}
          <button
            type="button"
            id="menu-image-btn"
            onClick={() => {
              onChangeMediaType('image');
              if (selectedFile?.mimeType.startsWith('video/')) {
                onSelectMedia(null);
              }
            }}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
              mediaType === 'image'
                ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/60 ring-1 ring-amber-500/40 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                mediaType === 'image' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
                <span>Image</span>
                <span className="text-[10px] text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  gemini-3.1-pro
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {isKm ? 'Analyze image to prompt text (វិភាគរូបភាពទៅជា Prompt)' : 'Analyze image to prompt text'}
              </p>
            </div>
          </button>

          {/* Video Mode Button */}
          <button
            type="button"
            id="menu-video-btn"
            onClick={() => {
              onChangeMediaType('video');
              if (selectedFile && !selectedFile.mimeType.startsWith('video/')) {
                onSelectMedia(null);
              }
            }}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
              mediaType === 'video'
                ? 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-violet-500/60 ring-1 ring-violet-500/40 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                mediaType === 'video' ? 'bg-violet-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <VideoIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
                <span>Video</span>
                <span className="text-[10px] text-violet-400 font-mono px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                  Motion & Transcription
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {isKm
                  ? 'Transcribe video content into descriptive prompts (បំប្លែងវីដេអូទៅជា Prompt)'
                  : 'Transcribe video content into descriptive prompts'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Under menu : Upload image or video file for processing */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isKm
              ? `បញ្ចូលឯកសារ ${mediaType === 'image' ? 'រូបភាព' : 'វីដេអូ'} សម្រាប់ដំណើរការ (Upload File)`
              : `Upload ${mediaType === 'image' ? 'image' : 'video'} file for processing`}
          </label>
          {selectedFile && (
            <button
              type="button"
              onClick={() => onSelectMedia(null)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              {isKm ? 'លុបឯកសារ' : 'Clear media'}
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          id="media-file-input"
          accept={
            mediaType === 'image'
              ? 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'
              : 'video/mp4,video/webm,video/quicktime,video/x-matroska'
          }
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Dropzone or Media Preview */}
        {!selectedFile ? (
          <div
            id="media-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 scale-[0.99]'
                : 'border-slate-700/80 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-950/90'
            }`}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center mb-3 text-slate-300 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mb-1">
                {isKm
                  ? `ចុចដើម្បីជ្រើសរើស ឬ អូសទម្លាក់ ${mediaType === 'image' ? 'រូបភាព' : 'វីដេអូ'}`
                  : `Click to upload or drag and drop ${mediaType === 'image' ? 'an image' : 'a video clip'}`}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mb-3">
                {mediaType === 'image'
                  ? 'Supports PNG, JPG, WebP, GIF, SVG (Up to 50MB)'
                  : 'Supports MP4, WebM, MOV with visual and audio analysis (Up to 50MB)'}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                <FileCheck className="w-3.5 h-3.5" />
                {isKm ? 'ជ្រើសរើសពីកុំព្យូទ័រ / ទូរស័ព្ទ' : 'Browse Files'}
              </span>
            </div>
          </div>
        ) : (
          <div className="border border-slate-700/80 bg-slate-950/80 rounded-xl overflow-hidden shadow-inner">
            {/* Media Player or Image Canvas */}
            <div className="relative bg-black/70 flex items-center justify-center min-h-[240px] max-h-[380px] overflow-hidden">
              {mediaType === 'image' || !selectedFile.mimeType.startsWith('video/') ? (
                <img
                  src={selectedFile.previewUrl}
                  alt={selectedFile.name}
                  className="max-h-[360px] w-auto object-contain mx-auto rounded-md shadow-lg"
                />
              ) : (
                <video
                  src={selectedFile.previewUrl}
                  controls
                  className="w-full max-h-[360px] rounded-md bg-black"
                />
              )}

              {/* Tag overlay */}
              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur border border-slate-700 text-xs px-2.5 py-1 rounded-md text-slate-300 flex items-center gap-1.5">
                {mediaType === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> : <VideoIcon className="w-3.5 h-3.5 text-violet-400" />}
                <span className="font-mono text-[11px] truncate max-w-[180px]">{selectedFile.name}</span>
              </div>
            </div>

            {/* Media Meta Info bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-300">{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">{selectedFile.mimeType}</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {isKm ? 'ប្តូរឯកសារ' : 'Change File'}
              </button>
            </div>
          </div>
        )}

        {/* Instant Samples Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {isKm ? 'សាកល្បងជាមួយគំរូភ្លាមៗ (Test Samples):' : 'Or try with a quick sample:'}
            </span>
          </div>
          {mediaType === 'image' ? (
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSampleImage(sample)}
                  className="text-left p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all text-xs group"
                >
                  <div className="font-medium text-slate-200 group-hover:text-amber-400 truncate">
                    {isKm ? sample.titleKm : sample.title}
                  </div>
                  <div className="text-[10px] text-slate-500">{sample.category}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={sampleLoading}
                onClick={() => loadSampleVideo('drone_landscape')}
                className="text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/50 transition-all text-xs group flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <div className="font-medium text-slate-200 group-hover:text-violet-300 truncate">
                    {isKm ? 'វីដេអូហោះលើភ្នំព្រះអាទិត្យអស្តង្គត' : 'Drone Sunset Mountain Flight'}
                  </div>
                  <div className="text-[10px] text-slate-500">HD 60FPS Camera Motion</div>
                </div>
              </button>
              <button
                type="button"
                disabled={sampleLoading}
                onClick={() => loadSampleVideo('cyberpunk_tunnel')}
                className="text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/50 transition-all text-xs group flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                    {isKm ? 'វីដេអូរូងពន្លឺ Cyberpunk នេអុង' : 'Cyberpunk Light Warp'}
                  </div>
                  <div className="text-[10px] text-slate-500">Fast Zoom Tunnel Speed</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Style Selector */}
      <div className="mb-5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          {isKm ? 'រចនាប័ទ្ម Prompt គោលដៅ (Prompt Target Style)' : 'Target AI Generator & Style'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              id: 'veo_cinematic',
              label: 'Veo 3 / Sora',
              sub: isKm ? 'ចលនា & កាមេរ៉ាភាពយន្ត' : 'Cinematic & Motion',
            },
            {
              id: 'flux_midjourney',
              label: 'Midjourney & Flux',
              sub: isKm ? 'ពន្លឺ & ក្រាហ្វិកកម្រិតខ្ពស់' : 'Shaders & Photoreal',
            },
            {
              id: 'detailed_transcription',
              label: 'Full Transcription',
              sub: isKm ? 'ពិពណ៌នាលម្អិតគ្រប់ជ្រុង' : 'All visual details',
            },
            {
              id: 'creative_director',
              label: 'Director Vision',
              sub: isKm ? 'អារម្មណ៍ & ទស្សនវិស័យ' : 'Aesthetics & Mood',
            },
          ].map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => onChangePromptStyle(style.id as PromptStyle)}
              className={`p-2 rounded-lg text-left border transition-all text-xs ${
                promptStyle === style.id
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30 font-medium'
                  : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold truncate">{style.label}</div>
              <div className="text-[10px] opacity-75 truncate">{style.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Button: Generate Prompt */}
      <button
        type="button"
        id="generate-prompt-btn"
        onClick={onGenerate}
        disabled={!selectedFile || isGenerating}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all ${
          !selectedFile || isGenerating
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : 'bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 text-white hover:brightness-110 active:scale-[0.99] shadow-rose-950/50 cursor-pointer'
        }`}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-white" />
            <span>
              {isKm
                ? `កំពុងដំណើរការវិភាគ ${mediaType === 'image' ? 'រូបភាព' : 'វីដេអូ'} ដោយ Gemini 3.1 Pro...`
                : `Analyzing ${mediaType === 'image' ? 'image' : 'video'} with Gemini 3.1 Pro...`}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span className="text-base tracking-wide">
              {isKm ? 'បង្កើត Prompt (Generate Prompt)' : 'Generate Prompt'}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
