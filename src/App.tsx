/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { MediaUploader } from './components/MediaUploader';
import { PromptOutput } from './components/PromptOutput';
import { VeoGeneratorModal } from './components/VeoGeneratorModal';
import { MediaType, PromptStyle, PromptAnalysis } from './types';
import { AlertCircle, Video, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [selectedFile, setSelectedFile] = useState<{
    file?: File;
    previewUrl: string;
    dataBase64: string;
    mimeType: string;
    name: string;
    size: number;
  } | null>(null);
  const [promptStyle, setPromptStyle] = useState<PromptStyle>('veo_cinematic');
  const [language, setLanguage] = useState<'km' | 'en'>('km');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PromptAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Veo 3 Video Modal State
  const [veoModalOpen, setVeoModalOpen] = useState(false);
  const [veoPromptText, setVeoPromptText] = useState('');

  const isKm = language === 'km';

  const handleGeneratePrompt = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType,
          data: selectedFile.dataBase64,
          mimeType: selectedFile.mimeType,
          promptStyle,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze media to prompt.');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message ||
          'Failed to process media. Please check your Gemini API key in Settings > Secrets.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenVeo = (promptText: string) => {
    setVeoPromptText(promptText);
    setVeoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      {/* Top Header */}
      <Header
        language={language}
        onToggleLanguage={setLanguage}
        activeTab={mediaType}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Error notification */}
        {errorMessage && (
          <div className="bg-rose-950/60 border border-rose-800 rounded-xl p-4 text-xs sm:text-sm text-rose-300 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">
                {isKm ? 'កំហុសក្នុងដំណើរការវិភាគ' : 'Processing Error'}
              </p>
              <p className="text-rose-300/90 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedFile && (
                <button
                  onClick={handleGeneratePrompt}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 border border-rose-700 text-rose-100 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isKm ? 'ព្យាយាមម្តងទៀត' : 'Retry'}</span>
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white p-1 rounded-lg hover:bg-rose-900/40 text-base"
                title="Dismiss"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Two-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* Left Column: Menu + Upload + Controls (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <MediaUploader
              mediaType={mediaType}
              onChangeMediaType={(type) => {
                setMediaType(type);
                setAnalysisResult(null);
                setErrorMessage(null);
              }}
              selectedFile={selectedFile}
              onSelectMedia={(media) => {
                setSelectedFile(media);
                setAnalysisResult(null);
                setErrorMessage(null);
              }}
              promptStyle={promptStyle}
              onChangePromptStyle={setPromptStyle}
              onGenerate={handleGeneratePrompt}
              isGenerating={isAnalyzing}
              language={language}
            />

            {/* Quick Helper / Info Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300">
                  {isKm ? 'របៀបប្រើប្រាស់៖' : 'How it works:'}
                </span>
                <p className="mt-1 leading-relaxed">
                  {isKm
                    ? '1. ជ្រើសរើសម៉ឺនុយ Image ឬ Video\n2. ផ្ទុកឯកសាររូបភាព ឬ វីដេអូ\n3. ចុច "Generate Prompt" ដើម្បីទទួលបាន Master Prompt លម្អិត\n4. អាចចុចចម្លង ឬ បង្កើតវីដេអូបន្តដោយ Veo 3'
                    : 'Select Image or Video mode, upload your visual file, click "Generate Prompt" to get the reverse-engineered prompt, then copy or generate fresh videos via Veo 3.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Output Display (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col min-h-[500px] h-full">
            <PromptOutput
              analysis={analysisResult}
              isLoading={isAnalyzing}
              onSendToVeo={handleOpenVeo}
              language={language}
              mediaType={mediaType}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {isKm
              ? 'កម្មវិធីវិភាគរូបភាព & វីដេអូទៅជា Prompt • ដំណើរការដោយ Gemini 3.1 Pro & Veo 3'
              : 'Image & Video Prompt Analyzer • Powered by Gemini 3.1 Pro & Veo 3'}
          </span>
          <button
            type="button"
            onClick={() => handleOpenVeo('')}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium text-xs"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isKm ? 'បើកម៉ាស៊ីនបង្កើតវីដេអូ Veo 3' : 'Open Veo 3 Generator'}</span>
          </button>
        </div>
      </footer>

      {/* Veo 3 Video Modal */}
      <VeoGeneratorModal
        isOpen={veoModalOpen}
        onClose={() => setVeoModalOpen(false)}
        initialPrompt={veoPromptText}
        language={language}
      />
    </div>
  );
}
