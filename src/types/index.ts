export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  default_branch: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface UploadedFile {
  name: string;
  size: number;
  content: File;
  extractedFiles: FileEntry[];
}

export interface FileEntry {
  path: string;
  content: string | Uint8Array;
  isDirectory: boolean;
}

export interface CommitInfo {
  message: string;
  branch: string;
  clearExisting: boolean;
}

export interface FileComparison {
  newFiles: FileEntry[];
  modifiedFiles: FileEntry[];
  unchangedFiles: FileEntry[];
  deletedFiles: FileEntry[];
}