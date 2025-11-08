
import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import { factCheck } from './services/geminiService';
import type { FactCheckResult } from './types';
import { CheckBadgeIcon, QuestionMarkCircleIcon } from './components/icons/Icons';


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FactCheckResult | null>(null);

  const handleSearch = async (claim: string) => {
    if (!claim.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const factCheckResult = await factCheck(claim);
      setResult(factCheckResult);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center my-8">
          <div className="flex items-center justify-center gap-3">
            <CheckBadgeIcon className="h-10 w-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Fact Check
            </h1>
          </div>
          <p className="mt-3 text-lg text-slate-400">
            A fast, no-nonsense fact checker for casual conversation.
          </p>
        </header>

        <main>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          <div className="mt-8 min-h-[300px]">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {result && <ResultDisplay result={result} />}
            {!isLoading && !error && !result && <InitialState />}
          </div>
        </main>
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Powered by Google Gemini. Results are for informational purposes only.</p>
        </footer>
      </div>
    </div>
  );
};

const InitialState: React.FC = () => (
    <div className="text-center flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-lg border border-slate-700">
        <QuestionMarkCircleIcon className="h-16 w-16 text-slate-500 mb-4" />
        <h2 className="text-2xl font-semibold text-white">Ready to check a fact?</h2>
        <p className="mt-2 text-slate-400 max-w-md">
            Enter a claim or question in the box above to get a quick, source-backed answer.
        </p>
        <p className="text-sm mt-4 text-slate-500">e.g., "Did humans ever see a live dodo?"</p>
    </div>
);


export default App;
