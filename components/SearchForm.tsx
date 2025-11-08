
import React, { useState } from 'react';
import { SearchIcon } from './icons/Icons';

interface SearchFormProps {
  onSearch: (claim: string) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [claim, setClaim] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(claim);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="h-6 w-6 text-slate-500" />
      </div>
      <input
        type="text"
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="Is tequila a stimulant?"
        disabled={isLoading}
        className="w-full pl-12 pr-32 py-4 text-lg bg-slate-800 border border-slate-700 rounded-full focus:ring-2 focus:ring-cyan-500 focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500 text-slate-100"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="absolute inset-y-0 right-0 m-1.5 px-6 py-2.5 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
      >
        {isLoading ? 'Checking...' : 'Check'}
      </button>
    </form>
  );
};
