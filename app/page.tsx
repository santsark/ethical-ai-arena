"use client";

import React, { useState, useEffect } from 'react';
import { AppState, ModelResponse, JudgeResult } from '../types';
import { generateEthicalResponse, judgeResponses } from '../services/geminiService';
import { logExperimentData } from '../services/databaseService';
import ResponseCard from '../components/ResponseCard';
import JudgeCard from '../components/JudgeCard';
import { Login } from '../components/Login';
import { AdminDashboard } from '../components/AdminDashboard';
import { Spinner } from '../components/Spinner';

// Initial Question
const DEFAULT_QUESTION = "What is 2 + 2?";
const MAX_USAGE_LIMIT = 5;

type AuthMode = 'USER' | 'ADMIN' | null;

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [judgeResults, setJudgeResults] = useState<JudgeResult[]>([]);

  // Hydration fix for localStorage
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('ethical_ai_usage_count');
    if (stored) {
      setUsageCount(parseInt(stored, 10));
    }
  }, []);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('ethical_ai_usage_count', newCount.toString());
  };

  const totalTokens = [...responses, ...judgeResults].reduce((acc, item) => acc + (item.tokensUsed || 0), 0);
  const totalCost = [...responses, ...judgeResults].reduce((acc, item) => acc + (item.cost || 0), 0);
  const limitReached = usageCount >= MAX_USAGE_LIMIT;

  const handleRunComparison = async () => {
    if (!question.trim()) return;
    if (limitReached) return;

    // 1. Reset
    setAppState(AppState.GENERATING_RESPONSES);
    setResponses([]);
    setJudgeResults([]);

    // Increment usage immediately
    incrementUsage();

    let currentResponses: ModelResponse[] = [];
    let currentJudgments: JudgeResult[] = [];
    let errorMsg: string | undefined = undefined;

    // 2. Generate Responses (Parallel)
    const models: Array<'OpenAI' | 'Gemini' | 'Claude'> = ['OpenAI', 'Gemini', 'Claude'];
    
    try {
      const responsePromises = models.map(model => generateEthicalResponse(model, question));
      const results = await Promise.all(responsePromises);
      currentResponses = results;
      setResponses(results);
      
      // 3. Move to Judging
      setAppState(AppState.JUDGING);
      
      // 4. Run Judges (Each model judges the set)
      const judgePromises = models.map(async (judgeName) => {
        return await judgeResponses(judgeName, question, results);
      });

      const judgments = await Promise.all(judgePromises);
      currentJudgments = judgments;
      setJudgeResults(judgments);
      setAppState(AppState.COMPLETE);

    } catch (e: any) {
      console.error("Workflow failed", e);
      errorMsg = e.message || "Unknown error";
      setAppState(AppState.COMPLETE);
    } finally {
      // 5. Capture Data (Success or Fail)
      await logExperimentData(question, currentResponses, currentJudgments, errorMsg);
    }
  };

  if (!isClient) return null; // Prevent hydration mismatch

  if (!authMode) {
    return <Login onLogin={(mode) => setAuthMode(mode)} />;
  }

  if (authMode === 'ADMIN') {
    return <AdminDashboard onLogout={() => setAuthMode(null)} />;
  }

  // --- USER APP VIEW ---

  const isGenerating = appState === AppState.GENERATING_RESPONSES;
  const isJudging = appState === AppState.JUDGING;
  const isProcessing = isGenerating || isJudging;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Ethical AI Arena</h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
               <p className="text-xs text-slate-500 uppercase tracking-wide">Usage Limit</p>
               <p className={`font-mono font-bold ${limitReached ? 'text-red-600' : 'text-slate-700'}`}>
                 {usageCount} / {MAX_USAGE_LIMIT}
               </p>
            </div>
            <div className="text-right hidden sm:block">
               <p className="text-xs text-slate-500 uppercase tracking-wide">Total Cost</p>
               <p className="font-mono font-bold text-green-600">${totalCost.toFixed(5)}</p>
            </div>
            <button 
              onClick={() => setAuthMode(null)}
              className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 relative overflow-hidden">
          {limitReached && (
             <div className="absolute inset-0 bg-slate-50/90 z-20 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md border border-red-100">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Usage Limit Reached</h3>
                  <p className="text-slate-600 mb-4">You have reached the maximum of {MAX_USAGE_LIMIT} analysis runs for this session.</p>
                  <p className="text-xs text-slate-400">Please contact administrator for extended access.</p>
                </div>
             </div>
          )}

          <div className="p-6">
            <label htmlFor="question" className="block text-sm font-semibold text-slate-700 mb-2">
              Ethical Question (or Test Prompt)
            </label>
            <textarea
              id="question"
              rows={3}
              className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 bg-slate-50 text-slate-900 placeholder-slate-400 resize-none transition-all"
              placeholder="Enter a difficult ethical dilemma or test prompt..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isProcessing || limitReached}
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-slate-400 italic">
                 Results are automatically captured for quality assurance.
              </span>
              <button
                onClick={handleRunComparison}
                disabled={isProcessing || !question.trim() || limitReached}
                className={`
                  inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all
                  ${isProcessing || !question.trim() || limitReached
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                  }
                `}
              >
                {isProcessing && <Spinner />}
                {isGenerating ? 'Generating Responses...' : isJudging ? 'Judging Responses...' : 'Compare Responses'}
              </button>
            </div>
          </div>
        </section>

        {/* Responses Grid */}
        {responses.length > 0 && (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Model Responses</h2>
              {isJudging && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">
                  Judging in progress...
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {responses.map((resp) => (
                <ResponseCard key={resp.id} response={resp} />
              ))}
            </div>
          </section>
        )}

        {/* Judging Results */}
        {appState === AppState.COMPLETE && judgeResults.length > 0 && (
          <section className="animate-fade-in-up delay-100">
             <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Judges' Verdicts</h2>
              <p className="text-slate-500 mt-1">Each model independently evaluated and ranked all responses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {judgeResults.map((result, idx) => (
                <JudgeCard key={idx} result={result} />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}