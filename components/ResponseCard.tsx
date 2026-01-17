import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ModelResponse } from '../types';

interface Props {
  response: ModelResponse;
}

const ResponseCard: React.FC<Props> = ({ response }) => {
  const isClaude = response.modelName === 'Claude';
  const isGemini = response.modelName === 'Gemini';
  const isOpenAI = response.modelName === 'OpenAI';

  let borderColor = 'border-gray-200';
  let badgeColor = 'bg-gray-100 text-gray-600';

  if (isClaude) {
    borderColor = 'border-orange-200';
    badgeColor = 'bg-orange-100 text-orange-700';
  } else if (isGemini) {
    borderColor = 'border-blue-200';
    badgeColor = 'bg-blue-100 text-blue-700';
  } else if (isOpenAI) {
    borderColor = 'border-green-200';
    badgeColor = 'bg-green-100 text-green-700';
  }

  return (
    <div className={`border ${borderColor} rounded-xl shadow-sm overflow-hidden flex flex-col h-full bg-white`}>
      <div className={`px-4 py-3 border-b ${borderColor} flex justify-between items-center bg-opacity-50`}>
        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
          {response.modelName}
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
           <span>{(response.timeTaken / 1000).toFixed(2)}s</span>
           <span className="text-slate-200">|</span>
           <span>{response.tokensUsed} toks</span>
           <span className="text-slate-200">|</span>
           <span>${response.cost.toFixed(5)}</span>
        </div>
      </div>
      <div className="p-5 overflow-y-auto max-h-[400px] prose prose-sm prose-slate max-w-none">
         {response.isError ? (
           <p className="text-red-500 italic text-sm">{response.content}</p>
         ) : (
           <ReactMarkdown>{response.content}</ReactMarkdown>
         )}
      </div>
    </div>
  );
};

export default ResponseCard;