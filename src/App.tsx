import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthPage } from './components/auth/AuthPage';
import { UserProfile } from './components/UserProfile';
import RepositoryStep from './components/RepositoryStep';
import FileUploadStep from './components/FileUploadStep';
import { GitOperationsStep } from './components/GitOperationsStep';
import { StepIndicator } from './components/StepIndicator';
import { GitBranch, Upload, Settings, CheckCircle } from 'lucide-react';
import { GitHubService } from './services/GitHubService';
import { Repository, UploadedFile } from './types';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/LoadingSpinner';

type Step = 'auth' | 'repository' | 'upload' | 'operations';

interface AppState {
  currentStep: Step;
  selectedRepository: Repository | null;
  uploadedFile: UploadedFile | null;
  githubService: GitHubService | null;
}

function App() {
  const { user, token, authMethod, isLoading } = useAuth();
  const [state, setState] = useState<AppState>({
    currentStep: 'auth',
    selectedRepository: null,
    uploadedFile: null,
    githubService: null,
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleAuthSuccess = (validatedToken: string) => {
    const githubService = new GitHubService(validatedToken);
    updateState({
      githubService,
      currentStep: 'repository'
    });
  };

  const handleRepositorySelected = (repository: Repository) => {
    updateState({
      selectedRepository: repository,
      currentStep: 'upload'
    });
  };

  const handleFileUploaded = (file: UploadedFile) => {
    updateState({
      uploadedFile: file,
      currentStep: 'operations'
    });
  };

  const handleOperationComplete = () => {
    // Reset to start over or show success state
    updateState({
      currentStep: 'auth',
      selectedRepository: null,
      uploadedFile: null,
    });
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
  if (isAuthenticated && state.currentStep === 'auth' && !state.githubService) {
    const githubService = new GitHubService(token!);
    updateState({
      githubService,
      currentStep: 'repository'
    });
  }

  const steps = [
    { id: 'auth', label: 'Authenticate', icon: Settings },
    { id: 'repository', label: 'Select Repository', icon: GitBranch },
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'operations', label: 'Push Changes', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === state.currentStep);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>
          {(() => {
            switch (state.currentStep) {
              case 'auth': return 'Authenticate with GitHub - GitHub Bridge';
              case 'repository': return 'Select Repository - GitHub Bridge';
              case 'upload': return 'Upload Project Files - GitHub Bridge';
              case 'operations': return 'Push to GitHub - GitHub Bridge';
              default: return 'GitHub Bridge';
            }
          })()}
        </title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" itemProp="name">
              GitHub Bridge
            </h1>
            <p className="mt-2 text-gray-600" itemProp="description">
              Upload your Bolt.new projects directly to GitHub repositories
            </p>
          </div>
          {isAuthenticated && <UserProfile />}
        </header>

        {/* Step Indicator */}
        {isAuthenticated && (
          <nav aria-label="Progress">
            <StepIndicator 
              steps={steps}
              currentStep={currentStepIndex}
            />
          </nav>
        )}

        {/* Main Content */}
        <main className="mt-8 bg-white rounded-lg shadow-lg p-4 sm:p-6" role="main">
          {!isAuthenticated && (
            <AuthPage
              onAuthSuccess={handleAuthSuccess}
            />
          )}

          {isAuthenticated && state.currentStep === 'repository' && state.githubService && (
            <RepositoryStep
              githubService={state.githubService}
              onRepositorySelected={handleRepositorySelected}
              onBack={() => updateState({ currentStep: 'repository' })}
            />
          )}

          {isAuthenticated && state.currentStep === 'upload' && (
            <FileUploadStep
              onFileUploaded={handleFileUploaded}
              onBack={() => updateState({ currentStep: 'repository' })}
            />
          )}

          {isAuthenticated && state.currentStep === 'operations' && state.githubService && state.selectedRepository && state.uploadedFile && (
            <GitOperationsStep
              githubService={state.githubService}
              repository={state.selectedRepository}
              uploadedFile={state.uploadedFile}
              onComplete={handleOperationComplete}
              onBack={() => updateState({ currentStep: 'upload' })}
            />
          )}
        </main>
        
        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Built with ❤️ for developers. 
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 ml-1">
              Powered by GitHub API
            </a>
          </p>
          <p className="mt-2">
            Your authentication is secure and {authMethod === 'manual' ? 'encrypted locally' : 'managed by Firebase'}.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;