import React, { useState, useEffect } from 'react';
import { ArrowLeft, GitCommit, Send, AlertTriangle, CheckCircle, Settings, Plus, Edit, FileCheck, ChevronDown, ChevronRight, Trash2, RefreshCw } from 'lucide-react';
import { GitHubService } from '../services/GitHubService';
import { Repository, UploadedFile, CommitInfo, FileComparison } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface GitOperationsStepProps {
  githubService: GitHubService;
  repository: Repository;
  uploadedFile: UploadedFile;
  onComplete: () => void;
  onStartOver: () => void;
  onBack: () => void;
}

export function GitOperationsStep({
  githubService,
  repository,
  uploadedFile,
  onComplete,
  onStartOver,
  onBack,
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
  const [showDeletedFiles, setShowDeletedFiles] = useState(false);
  const [selectedFilePaths, setSelectedFilePaths] = useState<Set<string>>(new Set());
  const [selectedDeletedFiles, setSelectedDeletedFiles] = useState<Set<string>>(new Set());

  // Add state for tracking comparison attempts and retries
  const [comparisonAttempts, setComparisonAttempts] = useState(0);
  const [lastComparisonTime, setLastComparisonTime] = useState<Date | null>(null);

  // Calculate if there are meaningful changes selected (new or modified files)
  const hasMeaningfulChangesSelected = React.useMemo(() => {
    if (!fileComparison || (selectedFilePaths.size === 0 && selectedDeletedFiles.size === 0)) {
      return false;
    }
    
    // Check if any selected files are new or modified
    const meaningfulFiles = new Set([
      ...fileComparison.newFiles.map(f => f.path),
      ...fileComparison.modifiedFiles.map(f => f.path)
    ]);
    
    // Return true if at least one selected file is meaningful (new, modified, or deleted)
    return Array.from(selectedFilePaths).some(path => meaningfulFiles.has(path)) || 
           selectedDeletedFiles.size > 0;
  }, [fileComparison, selectedFilePaths, selectedDeletedFiles]);

  // Reset all state when uploadedFile or repository changes
  useEffect(() => {
    // Reset all comparison-related state
    setFileComparison(null);
    setSelectedFilePaths(new Set());
    setSelectedDeletedFiles(new Set());
    setComparisonAttempts(0);
    setLastComparisonTime(null);
    setError(null);
    
    // Set initial commit message
    setCommitMessage(`Upload project from Bolt.new: ${uploadedFile.name.replace('.zip', '')}`);
    
    // Load branches and compare files
    loadBranches();
    compareFiles();
  }, [uploadedFile, repository]);

  // Re-compare files when branch changes
  useEffect(() => {
    if (selectedBranch !== repository.default_branch) {
      // Reset comparison state when branch changes
      setFileComparison(null);
      setSelectedFilePaths(new Set());
      setSelectedDeletedFiles(new Set());
      setComparisonAttempts(0);
      setLastComparisonTime(null);
      
      compareFiles();
    }
  }, [selectedBranch]);

  // Initialize selected files when file comparison is complete
  useEffect(() => {
    if (fileComparison) {
      const allFilePaths = new Set<string>();
      
      // Add all file paths to the selection by default
      fileComparison.newFiles.forEach(file => allFilePaths.add(file.path));
      fileComparison.modifiedFiles.forEach(file => allFilePaths.add(file.path));
      fileComparison.unchangedFiles.forEach(file => allFilePaths.add(file.path));
      
      setSelectedFilePaths(allFilePaths);
      
      // Don't auto-select deleted files - let user explicitly choose
      setSelectedDeletedFiles(new Set());
    }
  }, [fileComparison]);
  
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
    setError(null);
    const startTime = new Date();
    
    try {
      // Add a small delay to allow for GitHub API consistency
      if (comparisonAttempts > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const comparison = await githubService.compareRepositoryFiles(
        repository,
        selectedBranch,
        uploadedFile.extractedFiles
      );
      setFileComparison(comparison);
      setLastComparisonTime(startTime);
      setComparisonAttempts(prev => prev + 1);
    } catch (err) {
      console.error('Failed to compare files:', err);
      setError('Failed to compare files with repository. Using fallback comparison.');
      // If comparison fails, treat all files as new
      setFileComparison({
        newFiles: uploadedFile.extractedFiles,
        modifiedFiles: [],
        unchangedFiles: [],
        deletedFiles: [],
      });
      setLastComparisonTime(startTime);
      setComparisonAttempts(prev => prev + 1);
    } finally {
      setIsComparing(false);
    }
  };

  // Manual refresh function
  const handleRefreshComparison = async () => {
    setFileComparison(null);
    setSelectedFilePaths(new Set());
    setSelectedDeletedFiles(new Set());
    await compareFiles();
  };

  const handleBranchChange = (newBranch: string) => {
    setSelectedBranch(newBranch);
  };

  const handleFileSelectionChange = (filePath: string, isSelected: boolean) => {
    setSelectedFilePaths(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(filePath);
      } else {
        newSet.delete(filePath);
      }
      return newSet;
    });
  };

  const handleDeletedFileSelectionChange = (filePath: string, isSelected: boolean) => {
    setSelectedDeletedFiles(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(filePath);
      } else {
        newSet.delete(filePath);
      }
      return newSet;
    });
  };

  const handleSelectAll = (fileList: FileEntry[], isSelected: boolean) => {
    setSelectedFilePaths(prev => {
      const newSet = new Set(prev);
      fileList.forEach(file => {
        if (isSelected) {
          newSet.add(file.path);
        } else {
          newSet.delete(file.path);
        }
      });
      return newSet;
    });
  };

  const handleSelectAllDeleted = (fileList: FileEntry[], isSelected: boolean) => {
    setSelectedDeletedFiles(prev => {
      const newSet = new Set(prev);
      fileList.forEach(file => {
        if (isSelected) {
          newSet.add(file.path);
        } else {
          newSet.delete(file.path);
        }
      });
      return newSet;
    });
  };
  
  const handleUpload = async () => {
    if (!commitMessage.trim()) {
      setError('Please enter a commit message');
      return;
    }

    if (selectedFilePaths.size === 0 && selectedDeletedFiles.size === 0) {
      setError('Please select at least one file to upload or delete');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Filter files to only include selected ones
      const filesToCreateOrUpdate = uploadedFile.extractedFiles.filter(file => 
        selectedFilePaths.has(file.path)
      );

      // Get files to delete
      const filesToDelete = fileComparison?.deletedFiles.filter(file => 
        selectedDeletedFiles.has(file.path)
      ) || [];

      const commitInfo: CommitInfo = {
        message: commitMessage.trim(),
        branch: selectedBranch,
        clearExisting,
      };

      await githubService.uploadFiles(
        repository,
        filesToCreateOrUpdate,
        commitInfo,
        (progress) => setUploadProgress(progress),
        filesToDelete
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

  const handleStartOver = () => {
    onStartOver();
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-gray-900">
          Upload Successful!
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Your project has been successfully uploaded to {repository.full_name}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <a
            href={`${repository.html_url}/tree/${selectedBranch}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            View on GitHub
          </a>
          <button
            onClick={handleStartOver}
            className="btn-secondary"
          >
            Upload Another Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-center w-full">
          <h2 className="text-3xl font-bold text-gray-900">
            Commit & Push
          </h2>
          <p className="mt-2 text-xl text-gray-600">
            Configure your commit and push to {repository.full_name}
          </p>
        </div>
      </div>

      {/* Repository Info */}
      <div className="card p-6 bg-gray-50">
        <div className="flex items-center space-x-5">
          <img
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
            className="w-12 h-12 rounded-full border-2 border-gray-200"
          />
          <div>
            <p className="font-bold text-gray-900 text-lg">
              {repository.full_name}
            </p>
            <p className="text-gray-600 font-medium">
              {uploadedFile.extractedFiles.length} files to upload
            </p>
          </div>
        </div>
      </div>

      {/* Commit Configuration */}
      <div className="space-y-6">
        <div>
          <label className="block font-bold mb-3 text-gray-700 text-lg">
            Commit Message
          </label>
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Describe your changes..."
            disabled={isUploading}
          />
          <p className="text-sm mt-2 text-gray-500 font-medium">
            {commitMessage.length}/72 characters (recommended)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-3 text-gray-700 text-lg">
              Target Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="input-field"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-8 sm:pt-12">
            <input
              id="clearExisting"
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              disabled={isUploading}
            />
            <label htmlFor="clearExisting" className="text-gray-700 font-medium">
              Clear existing files
            </label>
          </div>
        </div>

        {clearExisting && (
          <div className="alert-warning">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <p className="font-bold text-amber-800 text-lg">
                  Warning: This will remove all existing files
                </p>
                <p className="mt-2 text-amber-700">
                  All files in the repository will be deleted and replaced with your uploaded files.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Comparison Results */}
      {isComparing ? (
        <div className="card p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
            <LoadingSpinner size="sm" />
            <span className="ml-3 text-gray-700 font-medium">
                Comparing files with repository...
                {comparisonAttempts > 0 && (
                  <span className="text-gray-500 ml-2">
                    (Attempt {comparisonAttempts + 1})
                  </span>
                )}
            </span>
            </div>
          </div>
        </div>
      ) : fileComparison && (
        <div className="card p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                File Changes Summary
              </h3>
              {lastComparisonTime && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastComparisonTime.toLocaleTimeString()}
                  {comparisonAttempts > 1 && (
                    <span className="ml-2">
                      (Attempt {comparisonAttempts})
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={handleRefreshComparison}
              disabled={isComparing || isUploading}
              className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh comparison with latest repository state"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
          
          {/* No Changes Detected */}
          {fileComparison.newFiles.length === 0 && fileComparison.modifiedFiles.length === 0 && fileComparison.unchangedFiles.length === 0 && fileComparison.deletedFiles.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                No Files Found
              </h4>
              <p className="text-gray-600 mb-6 text-lg">
                No files were extracted from the uploaded ZIP file.
              </p>
              <button
                onClick={handleRefreshComparison}
                disabled={isComparing || isUploading}
                className="btn-secondary"
              >
                <RefreshCw size={16} className="mr-2" />
                Retry Comparison
              </button>
            </div>
          ) : fileComparison.newFiles.length === 0 && fileComparison.modifiedFiles.length === 0 && fileComparison.deletedFiles.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                No New, Modified, or Deleted Files
              </h4>
              <p className="text-gray-600 mb-6 text-lg">
                All files are identical to the target branch and no files were deleted.
              </p>
              {fileComparison.unchangedFiles.length > 0 && (
                <div className="space-y-4">
                  <p className="text-gray-500 font-medium">
                    {fileComparison.unchangedFiles.length} unchanged file{fileComparison.unchangedFiles.length !== 1 ? 's' : ''} available
                  </p>
                  <p className="text-sm text-gray-500">
                    You can still select unchanged files to include in the commit if needed.
                  </p>
                  <button
                    onClick={handleRefreshComparison}
                    disabled={isComparing || isUploading}
                    className="btn-secondary mt-4"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh Comparison
                  </button>
                </div>
              )}
            </div>
          ) : (
          <div className="space-y-3">
            {/* New Files */}
            {fileComparison.newFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <button
                    onClick={() => setShowNewFiles(!showNewFiles)}
                    className="flex items-center text-green-600"
                  >
                    {showNewFiles ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <Plus size={18} className="ml-2 mr-3" />
                    <span className="font-bold">
                      {fileComparison.newFiles.length} new file{fileComparison.newFiles.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSelectAll(fileComparison.newFiles, true)}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleSelectAll(fileComparison.newFiles, false)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                {showNewFiles && (
                  <div className="ml-8 space-y-3">
                    {fileComparison.newFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`new-${index}`}
                          checked={selectedFilePaths.has(file.path)}
                          onChange={(e) => handleFileSelectionChange(file.path, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          disabled={isUploading}
                        />
                        <label htmlFor={`new-${index}`} className="font-mono text-gray-700 cursor-pointer flex-1">
                          + {file.path}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modified Files */}
            {fileComparison.modifiedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <button
                    onClick={() => setShowModifiedFiles(!showModifiedFiles)}
                    className="flex items-center text-yellow-600"
                  >
                    {showModifiedFiles ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <Edit size={18} className="ml-2 mr-3" />
                    <span className="font-bold">
                      {fileComparison.modifiedFiles.length} modified file{fileComparison.modifiedFiles.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSelectAll(fileComparison.modifiedFiles, true)}
                      className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleSelectAll(fileComparison.modifiedFiles, false)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                {showModifiedFiles && (
                  <div className="ml-8 space-y-3">
                    {fileComparison.modifiedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`modified-${index}`}
                          checked={selectedFilePaths.has(file.path)}
                          onChange={(e) => handleFileSelectionChange(file.path, e.target.checked)}
                          className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          disabled={isUploading}
                        />
                        <label htmlFor={`modified-${index}`} className="font-mono text-gray-700 cursor-pointer flex-1">
                          ~ {file.path}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Unchanged Files */}
            {fileComparison.unchangedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <button
                    onClick={() => setShowUnchangedFiles(!showUnchangedFiles)}
                    className="flex items-center text-gray-500"
                  >
                    {showUnchangedFiles ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <FileCheck size={18} className="ml-2 mr-3" />
                    <span className="font-bold">
                      {fileComparison.unchangedFiles.length} unchanged file{fileComparison.unchangedFiles.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSelectAll(fileComparison.unchangedFiles, true)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleSelectAll(fileComparison.unchangedFiles, false)}
                      className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                {showUnchangedFiles && (
                  <div className="ml-8 space-y-3">
                    {fileComparison.unchangedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`unchanged-${index}`}
                          checked={selectedFilePaths.has(file.path)}
                          onChange={(e) => handleFileSelectionChange(file.path, e.target.checked)}
                          className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                          disabled={isUploading}
                        />
                        <label htmlFor={`unchanged-${index}`} className="font-mono text-gray-600 cursor-pointer flex-1">
                          = {file.path}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deleted Files */}
            {fileComparison.deletedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <button
                    onClick={() => setShowDeletedFiles(!showDeletedFiles)}
                    className="flex items-center text-red-600"
                  >
                    {showDeletedFiles ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <Trash2 size={18} className="ml-2 mr-3" />
                    <span className="font-bold">
                      {fileComparison.deletedFiles.length} deleted file{fileComparison.deletedFiles.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSelectAllDeleted(fileComparison.deletedFiles, true)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleSelectAllDeleted(fileComparison.deletedFiles, false)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                {showDeletedFiles && (
                  <div className="ml-8 space-y-3">
                    {fileComparison.deletedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`deleted-${index}`}
                          checked={selectedDeletedFiles.has(file.path)}
                          onChange={(e) => handleDeletedFileSelectionChange(file.path, e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          disabled={isUploading}
                        />
                        <label htmlFor={`deleted-${index}`} className="font-mono text-gray-700 cursor-pointer flex-1">
                          - {file.path}
                        </label>
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
        <div className="alert-error">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="ml-3 text-red-800 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-bold text-lg">
              Uploading files...
            </span>
            <span className="text-gray-700 font-bold text-lg">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isUploading}
          className="btn-secondary"
        >
          Back
        </button>
        <button
          onClick={handleUpload}
          disabled={isUploading || !commitMessage.trim() || (selectedFilePaths.size === 0 && selectedDeletedFiles.size === 0) || !hasMeaningfulChangesSelected}
          className="btn-primary"
        >
          {isUploading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-3">Uploading...</span>
            </>
          ) : selectedFilePaths.size === 0 && selectedDeletedFiles.size === 0 ? (
            'No Files Selected'
          ) : !hasMeaningfulChangesSelected ? (
            'Nothing to Commit'
          ) : (
            <>
              <Send className="h-5 w-5 mr-3" />
              Push {selectedFilePaths.size + selectedDeletedFiles.size} Change{selectedFilePaths.size + selectedDeletedFiles.size !== 1 ? 's' : ''} to Repository
            </>
          )}
        </button>
      </div>
    </div>
  );
}