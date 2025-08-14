import React, { useState, useEffect } from 'react';
import { GitCommit, Send, AlertTriangle, CheckCircle, Settings, Plus, Edit, FileCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { GitHubService } from '../services/GitHubService';
import { Repository, UploadedFile, CommitInfo, FileComparison } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface GitOperationsStepProps {
  githubService: GitHubService;
  repository: Repository;
  uploadedFile: UploadedFile;
  onComplete: () => void;
}

export function GitOperationsStep({
  githubService,
  repository,
  uploadedFile,
  onComplete,
}: GitOperationsStepProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(repository.default_branch);
  const [clearExisting, setClearExisting] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileComparison, setFileComparison] = useState<FileComparison | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showNewFiles, setShowNewFiles] = useState(false);
  const [showModifiedFiles, setShowModifiedFiles] = useState(false);
  const [showUnchangedFiles, setShowUnchangedFiles] = useState(false);

  useEffect(() => {
    setCommitMessage(`Upload project from Bolt.new: ${uploadedFile.name.replace('.zip', '')}`);
    loadBranches();
    compareFiles();
  }, []);

  const loadBranches = async () => {
    try {
      const branchList = await githubService.getBranches(repository.owner.login, repository.name);
      setBranches(branchList);
    } catch (err) {
      console.error('Failed to load branches:', err);
      setBranches([repository.default_branch]);
    }
  };

  const compareFiles = async () => {
    setIsComparing(true);
    try {
      const comparison = await githubService.compareRepositoryFiles(
        repository,
        selectedBranch,
        uploadedFile.extractedFiles
      );
      setFileComparison(comparison);
    } catch (err) {
      console.error('Failed to compare files:', err);
      // If comparison fails, treat all files as new
      setFileComparison({
        newFiles: uploadedFile.extractedFiles,
        modifiedFiles: [],
        unchangedFiles: [],
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleBranchChange = (newBranch: string) => {
    setSelectedBranch(newBranch);
    // Re-compare files when branch changes
    compareFiles();
  };

  const handleUpload = async () => {
    if (!commitMessage.trim()) {
      setError('Please enter a commit message');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const commitInfo: CommitInfo = {
        message: commitMessage.trim(),
        branch: selectedBranch,
        clearExisting,
      };

      await githubService.uploadFiles(
        repository,
        uploadedFile.extractedFiles,
        commitInfo,
        (progress) => setUploadProgress(progress)
      );

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Upload Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your project has been successfully uploaded to {repository.full_name}
        </p>
        <div className="space-x-4">
          <a
            href={`${repository.html_url}/tree/${selectedBranch}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium inline-block"
          >
            View on GitHub
          </a>
          <button
            onClick={handleComplete}
            className="text-gray-700 hover:bg-gray-50 border border-gray-300 px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Upload Another Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Commit & Push
          </h2>
          <p className="mt-1 text-gray-600">
            Configure your commit and push to {repository.full_name}
          </p>
        </div>
      </div>

      {/* Repository Info */}
      <div className="border rounded-lg p-4 border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <img
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">
              {repository.full_name}
            </p>
            <p className="text-sm text-gray-600">
              {uploadedFile.extractedFiles.length} files to upload
            </p>
          </div>
        </div>
      </div>

      {/* Commit Configuration */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Commit Message
          </label>
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            placeholder="Describe your changes..."
            disabled={isUploading}
          />
          <p className="text-xs mt-1 text-gray-500">
            {commitMessage.length}/72 characters (recommended)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Target Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white border-gray-300 text-gray-900"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-6 sm:pt-8">
            <input
              id="clearExisting"
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              disabled={isUploading}
            />
            <label htmlFor="clearExisting" className="text-sm text-gray-700">
              Clear existing files
            </label>
          </div>
        </div>

        {clearExisting && (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  Warning: This will remove all existing files
                </p>
                <p className="text-sm mt-1 text-gray-700">
                  All files in the repository will be deleted and replaced with your uploaded files.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Comparison Results */}
      {isComparing ? (
        <div className="border rounded-lg p-4 border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-gray-700">
              Comparing files with repository...
            </span>
          </div>
        </div>
      ) : fileComparison && (
        <div className="border rounded-lg p-4 border-gray-200 bg-gray-50">
          <h3 className="font-medium mb-3 text-gray-900">
            File Changes Summary
          </h3>
          
          {/* No Changes Detected */}
          {fileComparison.newFiles.length === 0 && fileComparison.modifiedFiles.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Changes Detected
              </h4>
              <p className="text-gray-600 mb-4">
                All files are identical to the target branch. No commit is needed.
              </p>
              {fileComparison.unchangedFiles.length > 0 && (
                <p className="text-sm text-gray-500">
                  {fileComparison.unchangedFiles.length} file{fileComparison.unchangedFiles.length !== 1 ? 's' : ''} checked
                </p>
              )}
            </div>
          ) : (
          <div className="space-y-2">
            {/* New Files */}
            {fileComparison.newFiles.length > 0 && (
              <div>
                <button
                  onClick={() => setShowNewFiles(!showNewFiles)}
                  className="flex items-center w-full text-left p-2 rounded hover:bg-gray-100 transition-colors text-green-600 hover:bg-gray-100"
                >
                  {showNewFiles ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Plus size={16} className="ml-1 mr-2" />
                  <span className="font-medium">
                    {fileComparison.newFiles.length} new file{fileComparison.newFiles.length !== 1 ? 's' : ''}
                  </span>
                </button>
                {showNewFiles && (
                  <div className="ml-6 space-y-1">
                    {fileComparison.newFiles.map((file, index) => (
                      <div key={index} className="text-sm font-mono text-gray-700">
                        + {file.path}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modified Files */}
            {fileComparison.modifiedFiles.length > 0 && (
              <div>
                <button
                  onClick={() => setShowModifiedFiles(!showModifiedFiles)}
                  className="flex items-center w-full text-left p-2 rounded hover:bg-gray-100 transition-colors text-yellow-600 hover:bg-gray-100"
                >
                  {showModifiedFiles ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Edit size={16} className="ml-1 mr-2" />
                  <span className="font-medium">
                    {fileComparison.modifiedFiles.length} modified file{fileComparison.modifiedFiles.length !== 1 ? 's' : ''}
                  </span>
                </button>
                {showModifiedFiles && (
                  <div className="ml-6 space-y-1">
                    {fileComparison.modifiedFiles.map((file, index) => (
                      <div key={index} className="text-sm font-mono text-gray-700">
                        ~ {file.path}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Unchanged Files */}
            {fileComparison.unchangedFiles.length > 0 && (
              <div>
                <button
                  onClick={() => setShowUnchangedFiles(!showUnchangedFiles)}
                  className="flex items-center w-full text-left p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:bg-gray-100"
                >
                  {showUnchangedFiles ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <FileCheck size={16} className="ml-1 mr-2" />
                  <span className="font-medium">
                    {fileComparison.unchangedFiles.length} unchanged file{fileComparison.unchangedFiles.length !== 1 ? 's' : ''}
                  </span>
                </button>
                {showUnchangedFiles && (
                  <div className="ml-6 space-y-1">
                    {fileComparison.unchangedFiles.map((file, index) => (
                      <div key={index} className="text-sm font-mono text-gray-600">
                        = {file.path}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-gray-600" />
            <p className="ml-2 text-sm text-gray-800">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              Uploading files...
            </span>
            <span className="text-gray-700">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={isUploading || !commitMessage.trim() || (fileComparison && fileComparison.newFiles.length === 0 && fileComparison.modifiedFiles.length === 0)}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
        >
          {isUploading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Uploading...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {fileComparison && fileComparison.newFiles.length === 0 && fileComparison.modifiedFiles.length === 0 
                ? 'No Changes to Push' 
                : 'Push to Repository'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}