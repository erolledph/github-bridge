import { Octokit } from 'octokit';
import { Repository, FileEntry, CommitInfo } from '../types';

interface FileComparison {
  newFiles: FileEntry[];
  modifiedFiles: FileEntry[];
  unchangedFiles: FileEntry[];
}

export class GitHubService {
  private octokit: Octokit;
  private username: string = '';
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async validateToken(): Promise<{ valid: boolean; username?: string; scopes?: string[] }> {
    try {
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      this.username = user.login;
      
      // Check if token has required scopes by making test API calls
      const scopes = await this.getTokenScopes();
      const requiredScopes = ['repo', 'user:email'];
      const hasRequiredScopes = requiredScopes.every(scope => 
        scopes.some(tokenScope => tokenScope.includes(scope))
      );

      return {
        valid: true,
        username: user.login,
        scopes: hasRequiredScopes ? scopes : undefined
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { valid: false };
    }
  }

  private async getTokenScopes(): Promise<string[]> {
    try {
      // Make a request to get the token's scopes from headers
      const response = await this.octokit.request('GET /user', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      const scopes = response.headers['x-oauth-scopes'];
      return scopes ? scopes.split(', ').map(s => s.trim()) : [];
    } catch {
      return [];
    }
  }

  async getRepositories(): Promise<Repository[]> {
    try {
      // Add retry logic for better reliability
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 100,
          });
          
          return data as Repository[];
        } catch (error) {
          lastError = error;
          retries--;
          
          if (retries > 0) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      throw lastError;
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      throw new Error('Failed to fetch repositories');
    }
  }

  async getBranches(owner: string, repo: string): Promise<string[]> {
    try {
      const { data } = await this.octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });
      
      return data.map(branch => branch.name);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      return [];
    }
  }

  private async calculateSha1(content: string | Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    let data: Uint8Array;
    
    if (typeof content === 'string') {
      // For text files, GitHub uses the format: "blob <size>\0<content>"
      const blobContent = `blob ${encoder.encode(content).length}\0${content}`;
      data = encoder.encode(blobContent);
    } else {
      // For binary files, GitHub uses the format: "blob <size>\0<binary_content>"
      const sizeBytes = encoder.encode(`blob ${content.length}\0`);
      data = new Uint8Array(sizeBytes.length + content.length);
      data.set(sizeBytes);
      data.set(content, sizeBytes.length);
    }
    
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async compareRepositoryFiles(
    repository: Repository,
    branch: string,
    extractedFiles: FileEntry[]
  ): Promise<FileComparison> {
    try {
      const owner = repository.owner.login;
      const repo = repository.name;
      
      // Get current commit SHA
      let currentCommitSha: string;
      try {
        const { data: branchData } = await this.octokit.rest.repos.getBranch({
          owner,
          repo,
          branch,
        });
        currentCommitSha = branchData.commit.sha;
      } catch {
        // Branch doesn't exist, all files are new
        return {
          newFiles: extractedFiles,
          modifiedFiles: [],
          unchangedFiles: [],
          deletedFiles: [],
        };
      }

      // Get the tree recursively to get all files and their SHAs
      const { data: tree } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: currentCommitSha,
        recursive: 'true',
      });

      // Create a map of existing files with their SHAs
      const existingFiles = new Map<string, string>();
      tree.tree.forEach(item => {
        if (item.type === 'blob' && item.path && item.sha) {
          existingFiles.set(item.path, item.sha);
        }
      });

      // Create a set of extracted file paths for quick lookup
      const extractedFilePaths = new Set(extractedFiles.map(file => file.path));
      const newFiles: FileEntry[] = [];
      const modifiedFiles: FileEntry[] = [];
      const unchangedFiles: FileEntry[] = [];
      const deletedFiles: FileEntry[] = [];

      // Compare each extracted file
      for (const file of extractedFiles) {
        const existingSha = existingFiles.get(file.path);
        
        if (!existingSha) {
          // File doesn't exist in repository
          newFiles.push(file);
        } else {
          // File exists, compare content
          const fileSha = await this.calculateSha1(file.content!);
          
          if (fileSha === existingSha) {
            unchangedFiles.push(file);
          } else {
            modifiedFiles.push(file);
          }
        }
      }

      // Find deleted files (exist in repository but not in extracted files)
      for (const [filePath] of existingFiles) {
        if (!extractedFilePaths.has(filePath)) {
          deletedFiles.push({
            path: filePath,
            isDirectory: false,
            // No content for deleted files
          });
        }
      }
      return {
        newFiles,
        modifiedFiles,
        unchangedFiles,
        deletedFiles,
      };
    } catch (error) {
      console.error('Failed to compare repository files:', error);
      // If comparison fails, treat all files as new
      return {
        newFiles: extractedFiles,
        modifiedFiles: [],
        unchangedFiles: [],
        deletedFiles: [],
      };
    }
  }

  async uploadFiles(
    repository: Repository,
    filesToUpdate: FileEntry[],
    filesToDelete: FileEntry[],
    commitInfo: CommitInfo,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      const owner = repository.owner.login;
      const repo = repository.name;
      const branch = commitInfo.branch;

      // Get current commit SHA
      let currentCommitSha: string;
      try {
        const { data: branchData } = await this.octokit.rest.repos.getBranch({
          owner,
          repo,
          branch,
        });
        currentCommitSha = branchData.commit.sha;
      } catch {
        // Branch doesn't exist, create it from default branch
        const { data: defaultBranch } = await this.octokit.rest.repos.getBranch({
          owner,
          repo,
          branch: repository.default_branch,
        });
        currentCommitSha = defaultBranch.commit.sha;
      }

      onProgress?.(10);

      // Get current tree
      const { data: currentCommit } = await this.octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: currentCommitSha,
      });

      onProgress?.(20);

      // Create tree entries for files to update
      const updateEntries = filesToUpdate
        .filter(file => !file.isDirectory)
        .map(file => ({
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          ...(typeof file.content === 'string'
            ? { content: file.content! }
            : { 
                content: Buffer.from(file.content!).toString('base64'),
                encoding: 'base64' as const
              }
          ),
        }));

      // Create tree entries for files to delete
      const deleteEntries = filesToDelete.map(file => ({
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: null, // This tells GitHub to delete the file
      }));

      // Combine all tree entries
      const treeEntries = [...updateEntries, ...deleteEntries];
      onProgress?.(40);

      // Create new tree
      const { data: newTree } = await this.octokit.rest.git.createTree({
        owner,
        repo,
        tree: treeEntries,
        base_tree: commitInfo.clearExisting ? undefined : currentCommit.tree.sha,
      });

      onProgress?.(60);

      // Create new commit
      const { data: newCommit } = await this.octokit.rest.git.createCommit({
        owner,
        repo,
        message: commitInfo.message,
        tree: newTree.sha,
        parents: [currentCommitSha],
      });

      onProgress?.(80);

      // Update branch reference
      await this.octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha,
      });

      onProgress?.(100);
    } catch (error) {
      console.error('Failed to upload files:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRepository(name: string, description?: string, isPrivate: boolean = false): Promise<Repository> {
    try {
      // Validate repository name
      if (!name || name.trim().length === 0) {
        throw new Error('Repository name is required');
      }
      
      if (name.length > 100) {
        throw new Error('Repository name must be 100 characters or less');
      }
      
      const { data } = await this.octokit.rest.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      });
      
      return data as Repository;
    } catch (error) {
      console.error('Failed to create repository:', error);
      
      // Handle specific GitHub API errors
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        if (apiError.response?.status === 422) {
          const errorData = apiError.response.data;
          if (errorData?.errors?.[0]?.message) {
            throw new Error(errorData.errors[0].message);
          } else if (errorData?.message) {
            throw new Error(errorData.message);
          } else {
            throw new Error('Repository name already exists or is invalid');
          }
        } else if (apiError.response?.status === 401) {
          throw new Error('Authentication failed. Please check your token permissions.');
        } else if (apiError.response?.status === 403) {
          throw new Error('Insufficient permissions. Make sure your token has repo scope.');
        }
      }
      
      throw new Error(`Failed to create repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}