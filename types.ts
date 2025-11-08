
export interface Source {
  title: string;
  url: string;
  date: string;
}

export interface FactCheckResult {
  answer: string;
  confidence: number;
  sources: Source[];
  speak: string;
  notes?: string;
  next_searches?: string[];
}
