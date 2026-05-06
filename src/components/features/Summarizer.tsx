
import React, { useState, useContext } from 'react';
import { Sparkles, FileText, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LanguageContext } from '../../contexts/LanguageContext';

const Summarizer: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const { t } = useContext(LanguageContext);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async (): Promise<void> => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Please provide a concise, structured summary of the following study material. Use bullet points for key takeaways and a short concluding "Focus Tip".\n\nMaterial:\n${input}`,
        config: {
          systemInstruction: "You are an expert study assistant. Your goal is to help students understand complex topics quickly by providing clear, structured summaries.",
        }
      });

      if (response.text) {
        setSummary(response.text);
      } else {
        throw new Error("No summary generated.");
      }
    } catch (err) {
      console.error("Summarization failed:", err);
      setError("Failed to generate summary. Please check your API key or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (): void => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`h-full flex flex-col bg-slate-50 dark:bg-slate-900/50 ${isMobile ? 'p-4' : 'p-8'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('summarizer')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('summarizerDesc')}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-[200px]">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <FileText size={16} />
            {t('studyMaterial')}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('summaryPlaceholder')}
            className="flex-1 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-900 dark:text-white transition-all"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSummarize}
            disabled={isLoading || !input.trim()}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all transform active:scale-95"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {isLoading ? t('aiThinking') : t('generateSummary')}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {summary && (
          <div className="flex-1 flex flex-col min-h-[200px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                {t('summary')}
              </label>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
            <div className="flex-1 p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 overflow-y-auto prose dark:prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">
                {summary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
