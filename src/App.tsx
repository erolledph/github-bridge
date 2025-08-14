import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { AuthPage } from './components/auth/AuthPage';
import { UserProfile } from './components/UserProfile';
import RepositoryStep from './components/RepositoryStep';
import FileUploadStep from './components/FileUploadStep';
import { GitOperationsStep } from './components/GitOperationsStep';
import { GitHubService } from './services/GitHubService';
import { Repository, UploadedFile } from './types';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const { user, token, authMethod, isLoading } = useAuth();
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [githubService, setGithubService] = useState<GitHubService | null>(null);

  const handleAuthSuccess = (validatedToken: string) => {
    const service = new GitHubService(validatedToken);
    setGithubService(service);
  };

  const handleRepositorySelected = (repository: Repository) => {
    setSelectedRepository(repository);
  };

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFile(file);
  };

  const handleOperationComplete = () => {
    // Reset to start over or show success state
    setSelectedRepository(null);
    setUploadedFile(null);
  };

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine if user is authenticated
  const isAuthenticated = (user && authMethod === 'oauth') || (token && authMethod === 'manual');

  // Auto-advance to repository step if authenticated
  if (isAuthenticated && !githubService && token) {
    const service = new GitHubService(token!);
    setGithubService(service);
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white flex flex-col">
        <Helmet>
          <title>GitHub Bridge - Upload Bolt.new Projects to GitHub</title>
        </Helmet>
      
        <div className="flex-1">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <img 
                    src="/favicon.svg" 
                    alt="GitHub Bridge Logo" 
                    className="h-8 w-8"
                  />
                </div>
              </div>
              {isAuthenticated && <UserProfile />}
            </header>

            {/* Main Content */}
            <main className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8" role="main">
              {/* Authentication Section */}
              {!isAuthenticated && (
                <section>
                  <AuthPage onAuthSuccess={handleAuthSuccess} />
                </section>
              )}

              {/* Repository Selection Section */}
              {isAuthenticated && githubService && (
                <section className={selectedRepository ? 'mb-8 pb-8 border-b border-gray-200' : ''}>
                  <RepositoryStep
                    githubService={githubService}
                    onRepositorySelected={handleRepositorySelected}
                  />
                </section>
              )}

              {/* File Upload Section */}
              {isAuthenticated && selectedRepository && (
                <section className={uploadedFile ? 'mt-8 pt-8 mb-8 pb-8 border-t border-gray-200 border-b' : 'mt-8 pt-8 border-t border-gray-200'}>
                  <FileUploadStep
                    onFileUploaded={handleFileUploaded}
                  />
                </section>
              )}

              {/* Git Operations Section */}
              {isAuthenticated && githubService && selectedRepository && uploadedFile && (
                <section className="mt-8 pt-8 border-t border-gray-200">
                  <GitOperationsStep
                    githubService={githubService}
                    repository={selectedRepository}
                    uploadedFile={uploadedFile}
                    onComplete={handleOperationComplete}
                  />
                </section>
              )}
            </main>
          </div>
        </div>
        
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;