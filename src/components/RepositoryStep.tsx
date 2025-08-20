import React, { useState, useEffect } from 'react';
import { ArrowLeft, GitBranch, Search, Plus, Lock, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { GitHubService } from '../services/GitHubService';
import { Repository } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface RepositoryStepProps {
  githubService: GitHubService | null;
  onRepositorySelected: (repository: Repository) => void;
  onBack: () => void;
}

export default function RepositoryStep({
  githubService,
  onRepositorySelected,
  onBack,
}: RepositoryStepProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (githubService) {
      loadRepositories();
    } else {
      setError('GitHub service not available. Please authenticate again.');
      setIsLoading(false);
    }
  }, [githubService]);

  useEffect(() => {
    const filtered = repositories.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRepositories(filtered);
  }, [repositories, searchTerm]);

  const loadRepositories = async () => {
    if (!githubService) {
      setError('GitHub service not available');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const repos = await githubService.getRepositories();
      setRepositories(repos);
      setFilteredRepositories(repos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubService) {
      setCreateError('GitHub service not available');
      return;
    }
    
    if (!newRepoName.trim()) return;

    // Validate repository name
    const repoName = newRepoName.trim();
    if (!/^[a-zA-Z0-9._-]+$/.test(repoName)) {
      setCreateError('Repository name can only contain letters, numbers, dots, hyphens, and underscores');
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      const newRepo = await githubService.createRepository(
        repoName,
        newRepoDescription.trim() || undefined,
        newRepoPrivate
      );
      
      // Add the new repository to the list and select it
      setRepositories(prev => [newRepo, ...prev]);
      setNewRepoName('');
      setNewRepoDescription('');
      setNewRepoPrivate(false);
      setShowCreateForm(false);
      
      // Automatically select the newly created repository
      onRepositorySelected(newRepo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create repository';
      console.error('Repository creation error:', err);
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Select Repository
        </h2>
        <p className="mt-1 text-gray-600">
          Choose an existing repository or create a new one
        </p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create New
        </button>
      </div>

      {/* Create Repository Form */}
      {showCreateForm && (
        <div className="border rounded-lg p-6 border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Create New Repository
          </h3>
          <form onSubmit={handleCreateRepository} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Repository Name *
              </label>
              <input
                type="text"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                required
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Description (Optional)
              </label>
              <textarea
                value={newRepoDescription}
                onChange={(e) => setNewRepoDescription(e.target.value)}
                placeholder="A brief description of your project..."
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                disabled={isCreating}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="private-repo"
                type="checkbox"
                checked={newRepoPrivate}
                onChange={(e) => setNewRepoPrivate(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-600"
                disabled={isCreating}
              />
              <label htmlFor="private-repo" className="text-sm text-gray-700">
                Make repository private
              </label>
            </div>
            
            {createError && (
              <div className="bg-white border border-gray-300 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                  <p className="ml-2 text-sm text-gray-800">
                    {createError}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewRepoName('');
                  setNewRepoDescription('');
                  setNewRepoPrivate(false);
                  setCreateError(null);
                }}
                disabled={isCreating}
                className="px-4 py-2 border rounded-lg transition-colors border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newRepoName.trim() || isCreating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  'Create Repository'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-600">Loading repositories...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <p className="ml-2 text-gray-800">{error}</p>
          </div>
          <button
            onClick={loadRepositories}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center mx-auto mt-3"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        </div>
      )}

      {/* Repository List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filteredRepositories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No repositories match your search.' : 'No repositories found.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRepositories.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => onRepositorySelected(repo)}
                  className="w-full text-left p-4 border rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors group border-gray-200 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 truncate">
                          {repo.name}
                        </h3>
                        {repo.private ? (
                          <Lock size={14} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <Globe size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <GitBranch size={16} className="text-gray-400 group-hover:text-green-600 flex-shrink-0 ml-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}