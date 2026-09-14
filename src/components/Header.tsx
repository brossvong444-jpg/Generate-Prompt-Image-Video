import React from 'react';
import { Sparkles, Video, Image as ImageIcon, Wand2, Globe, Cpu } from 'lucide-react';

interface HeaderProps {
  language: 'en' | 'km';
  onToggleLanguage: (lang: 'en' | 'km') => void;
  activeTab: 'image' | 'video' | 'veo_generate';
}

export const Header: React.FC<HeaderProps> = ({ language, onToggleLanguage, activeTab }) => {
  const isKm = language === 'km';

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-950/40 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                {isKm ? 'កម្មវិធីវិភាគរូបភាព & វីដេអូទៅជា Prompt' : 'Image & Video Prompt Analyzer'}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini 3.1 Pro
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded-full">
                Veo 3 Preview
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isKm
                ? 'បញ្ជូនរូបភាព ឬ វីដេអូ ដើម្បីដកស្រង់ Prompt លម្អិតសម្រាប់ AI Generative Models'
                : 'Reverse-engineer visual media into production-ready prompts for Midjourney, Flux, Veo & Sora'}
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                language === 'en'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onToggleLanguage('km')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                language === 'km'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ភាសាខ្មែរ
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 border border-slate-700/40 rounded-lg px-2.5 py-1">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[11px] text-slate-300">gemini-3.1-pro</span>
          </div>
        </div>
      </div>
    </header>
  );
};
