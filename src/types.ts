export type KeySystem = "no-key" | "key-required";
export type ExecutorState = "online" | "updated" | "maintenance";

export interface ScriptItem {
  id: string;
  slug: string;
  title: string;
  game: string;
  category: string;
  summary: string;
  description: string;
  features: string[];
  keySystem: KeySystem;
  keyUrl?: string;
  executors: string[];
  thumbnail: string;
  scriptCode: string;
  verifiedByAdmin: boolean;
  published: boolean;
  views: number;
  updatedAt: string;
}

export interface ExecutorItem {
  id: string;
  name: string;
  status: ExecutorState;
  platforms: string[];
  compatibleScripts: number;
  description: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  updatedAt: string;
}

export interface ContentData {
  version: number;
  updatedAt: string;
  scripts: ScriptItem[];
  executors: ExecutorItem[];
  categories: CategoryItem[];
}

export interface GitHubConnection {
  owner: string;
  repo: string;
  branch: string;
  contentPath: string;
  token: string;
  login: string;
}

export interface GitHubFile<T> {
  data: T;
  sha: string;
}
