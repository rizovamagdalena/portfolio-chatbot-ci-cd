import axios from 'axios';

// const API_BASE_URL = '/api';
const API_BASE_URL = 'http://localhost:8000/api';


export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API requests and responses
export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface CreateProjectResponse {
  project_id: string;
}

export interface QueryRequest {
  query: string;
  top_k?: number;
}

export interface ProjectInfo {
  project_id: string;
  project_name: string;
  chunk_type: string;
  relevance_score: number;
  content: string;
}

export interface QueryResponse {
  answer: string;
  sources: ProjectInfo[];
  projects_searched: string[];
}

// API functions
export const createProject = async (data: CreateProjectRequest): Promise<CreateProjectResponse> => {
  const response = await api.post<CreateProjectResponse>('/projects', data);
  return response.data;
};

export const queryProjects = async (data: QueryRequest): Promise<QueryResponse> => {
  const response = await api.post<QueryResponse>('/query', data);
  return response.data;
};

export const getProjects = async (): Promise<Record<string, string>> => {
  const response = await api.get<{ projects: Record<string, string> }>('/projects');
  return response.data.projects;
};