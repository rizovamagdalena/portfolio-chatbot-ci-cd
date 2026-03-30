export interface Source {
  project_id: string;
  project_name: string;
  chunk_type: string;
  relevance_score: number;
  content: string;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  projects_searched: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Source[];
  projectsSearched?: string[];
  timestamp: Date;
}
