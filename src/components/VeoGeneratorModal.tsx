import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Video, 
  Sparkles, 
  Download, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Monitor,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { copyToClipboard } from '../utils/mediaUtils';

interface VeoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  language: 'en' | 'km';
}

const REASSURING_MESSAGES = [
  'Initializing Veo 3 fast neural rendering pipeline...',
  'Interpreting cinematic camera instructions and physics...',
  'Synthesizing photorealistic lighting and spatial depth...',
  'Generating smooth temporal video frames at 720p...',
  'Finalizing encoding and audio-visual synchronization...',
];

export const VeoGeneratorModal: React.FC<VeoGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  language,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [status, setStatus] = useState<'idle' | 'generating' | 'polling' | 'ready' | 'error'>('idle');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [progressMsgIndex, setProgressMsgIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isKm = language === 'km';

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    const success = await copyToClipboard(prompt);
    if (success) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'generating' || status === 'polling') {
      interval = setInterval(() => {
        setProgressMsgIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Clean up poll on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    if (!prompt.trim()) return;

    setStatus('generating');
    setErrorMessage(null);
    setVideoUrl(null);
    setOperationName(null);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.operationName) {
        throw new Error(data.error || 'Failed to start Veo video generation');
      }

      setOperationName(data.operationName);
      setStatus('polling');
      startPolling(data.operationName);
    } catch (err: any) {
      console.error('Veo generation error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error generating video');
    }
  };

  const startPolling = (opName: string) => {
    const poll = async () => {
      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.done) {
          // Download video stream from backend
          await downloadGeneratedVideo(opName);
        } else {
          // Poll again after 5 seconds
          pollTimerRef.current = setTimeout(poll, 5000);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Error while polling video');
      }
    };

    pollTimerRef.current = setTimeout(poll, 4000);
  };

  const downloadGeneratedVideo = async (opName: string) => {
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!res.ok) {
        throw new Error('Failed to download generated video file');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus('ready');
    } catch (err: any) {
      console.error('Download error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error retrieving video stream');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-500 flex items-center justify-center text-white shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isKm ? 'បង្កើតវីដេអូដោយ Veo 3 (Veo 3 Video Generator)' : 'Generate Video with Veo 3'}</span>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  veo-3.1-fast-generate-preview
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isKm 
                  ? 'បង្កើតវីដេអូភាពយន្តពី Prompt ជាមួយសមាមាត្រ 16:9 (ផ្ដេក) ឬ 9:16 (បញ្ឈរ)' 
                  : 'Fast high-definition video synthesis with 16:9 (landscape) or 9:16 (portrait)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Prompt input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {isKm ? 'អត្ថបទ Prompt សម្រាប់បង្កើតវីដេអូ' : 'Prompt for Video Generation'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={status === 'generating' || status === 'polling'}
              rows={4}
              className="w-full bg-slate-950 text-slate-100 text-xs sm:text-sm font-mono p-3 rounded-xl border border-slate-700/80 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
              placeholder="Describe the video scene, camera movements, and lighting..."
            />
          </div>

          {/* Aspect ratio requirement: 16:9 or 9:16 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {isKm ? 'សមាមាត្រទំហំវីដេអូ (Aspect Ratio)' : 'Aspect Ratio'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={status === 'generating' || status === 'polling'}
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-1 ring-purple-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>16:9 Landscape (ផ្ដេក)</span>
              </button>
              <button
                type="button"
                disabled={status === 'generating' || status === 'polling'}
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-1 ring-purple-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>9:16 Portrait (បញ្ឈរ)</span>
              </button>
            </div>
          </div>

          {/* Status & Progress View */}
          {(status === 'generating' || status === 'polling') && (
            <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-5 text-center space-y-3">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                <Video className="w-5 h-5 text-purple-400 absolute" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {isKm ? 'កំពុងបង្កើតវីដេអូដោយ Veo 3...' : 'Generating Video with Veo 3...'}
                </p>
                <p className="text-xs text-purple-300 mt-1 font-mono transition-opacity duration-300">
                  {REASSURING_MESSAGES[progressMsgIndex]}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                {isKm
                  ? 'ការបង្កើតវីដេអូ AI អាចចំណាយពេល 30 ទៅ 90 វិនាទី។ សូមរង់ចាំបន្តិច...'
                  : 'AI video generation typically takes 30-90 seconds. Please hold on while Veo renders your scene.'}
              </p>
            </div>
          )}

          {/* Ready Result View */}
          {status === 'ready' && videoUrl && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {isKm ? 'វីដេអូត្រូវបានបង្កើតជោគជ័យ!' : 'Video Generated Successfully!'}
                </span>
                <span className="font-mono text-slate-400">{aspectRatio}</span>
              </div>
              <div className="rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className={`w-full ${aspectRatio === '9:16' ? 'max-h-[380px] object-contain' : 'aspect-video object-cover'}`}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <a
                  href={videoUrl}
                  download={`veo-video-${Date.now()}.mp4`}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isKm ? 'ទាញយកវីដេអូ (MP4)' : 'Download MP4'}</span>
                </a>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 text-xs text-rose-300 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-200">{isKm ? 'ព័ត៌មានអំពីការបង្កើតវីដេអូ' : 'Video Generation Notice'}</p>
                  <p className="text-rose-300/90 mt-1 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-rose-800/50 flex items-center justify-between">
                <span className="text-[11px] text-rose-300/80">
                  {isKm ? 'អត្ថបទ Prompt របស់អ្នកអាចចម្លងយកទៅប្រើបានភ្លាមៗ៖' : 'Your prompt is ready to copy:'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? (isKm ? 'បានចម្លង!' : 'Copied!') : (isKm ? 'ចម្លង Master Prompt' : 'Copy Master Prompt')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {isKm ? 'បិទ' : 'Close'}
          </button>
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={!prompt.trim() || status === 'generating' || status === 'polling'}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {status === 'generating' || status === 'polling' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isKm ? 'កំពុងដំណើរការ...' : 'Rendering...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>{isKm ? 'ចាប់ផ្តើមបង្កើតវីដេអូ' : 'Start Video Generation'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
