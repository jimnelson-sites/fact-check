
import React from 'react';
import type { FactCheckResult } from '../types';
import { LinkIcon, LightBulbIcon } from './icons/Icons';

interface ResultDisplayProps {
  result: FactCheckResult;
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'text-green-400';
  if (confidence >= 0.6) return 'text-yellow-400';
  return 'text-red-400';
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const { answer, confidence, sources, notes, next_searches } = result;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-white leading-tight pr-4">
          {answer}
        </h2>
        <div className={`text-lg font-bold flex-shrink-0 ${getConfidenceColor(confidence)}`}>
          {`${(confidence * 100).toFixed(0)}% Confident`}
        </div>
      </div>
      
      {notes && notes.trim() && (
        <div className="mt-4 mb-5 p-3 bg-slate-700/50 rounded-md text-slate-300 italic text-sm">
          {notes}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-3">Sources</h3>
        <ul className="space-y-3">
          {sources.map((source, index) => (
            <li key={index} className="flex items-start">
              <LinkIcon className="h-5 w-5 text-slate-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
                >
                  {source.title}
                </a>
                <span className="block text-xs text-slate-400">{new URL(source.url).hostname} &middot; {source.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {next_searches && next_searches.length > 0 && (
         <div className="mt-6 border-t border-slate-700 pt-5">
            <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-300" />
                Next Searches
            </h3>
            <div className="flex flex-wrap gap-2">
                {next_searches.map((search, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">
                        {search}
                    </span>
                ))}
            </div>
         </div>
      )}
    </div>
  );
};
