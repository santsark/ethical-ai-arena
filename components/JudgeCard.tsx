import React from 'react';
import { JudgeResult } from '../types';

interface Props {
  result: JudgeResult;
}

const JudgeCard: React.FC<Props> = ({ result }) => {
  const { judgeName, parsedOutput, isError, timeTaken, tokensUsed, cost } = result;

  // Safe check for valid rankings
  const rankings = parsedOutput?.rankings;
  const hasValidRankings = Array.isArray(rankings) && rankings.length > 0;

  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm relative">
       <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-slate-400">
         <span>{(timeTaken / 1000).toFixed(2)}s</span>
         <span className="text-slate-300">|</span>
         <span>{tokensUsed} toks</span>
         <span className="text-slate-300">|</span>
         <span>${cost.toFixed(5)}</span>
      </div>
      
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Judge: <span className="text-slate-900">{judgeName}</span>
      </h3>

      {isError || !hasValidRankings ? (
        <div className="text-red-500 text-sm">
            <p className="font-bold mb-1">Error or Invalid JSON:</p>
            <div className="max-h-32 overflow-y-auto font-mono text-xs bg-red-50 p-2 rounded border border-red-100">
               {result.rawOutput || "No output"}
            </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings!.slice().sort((a, b) => a.position - b.position).map((rank) => (
            <div 
              key={rank.model} 
              className={`p-3 rounded-lg border flex items-start gap-3 ${
                rank.position === 1 ? 'bg-white border-yellow-300 shadow-sm ring-1 ring-yellow-100' : 'bg-slate-100 border-transparent'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                rank.position === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'
              }`}>
                #{rank.position}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800">{rank.model}</span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Score: {rank.score}/10</span>
                </div>
                <p className="text-sm text-slate-600 leading-snug">{rank.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JudgeCard;