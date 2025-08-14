import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { AuthPage } from './components/auth/AuthPage';
import { UserProfile } from './components/UserProfile';
import RepositoryStep from './components/RepositoryStep';
import FileUploadStep from './components/FileUploadStep';
import { GitOperationsStep } from './components/GitOperationsStep';
import { StepIndicator } from './components/StepIndicator';
import { GitBranch, Upload, Github, CheckCircle } from 'lucide-react';
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
  const { user, isLoading } = useAuth();
  const [state, setState] = useState<AppState>({
    currentStep: 'auth',
    selectedRepository: null,
    uploadedFile: null,
    githubService: null,
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleAuthSuccess = (token: string) => {
    const githubService = new GitHubService(token);
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
      currentStep: 'repository',
      selectedRepository: null,
      uploadedFile: null,
      githubService: state.githubService, // Keep the GitHub service
    });
  };

  const handleStartOver = () => {
    // Complete reset including GitHub service
    updateState({
      currentStep: 'repository',
      selectedRepository: null,
      uploadedFile: null,
      githubService: state.githubService, // Keep the GitHub service
    });
  };

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-6 text-gray-600 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  // Determine if user is authenticated
  const isAuthenticated = user !== null;

  // Auto-advance to repository step if authenticated
  if (isAuthenticated && state.currentStep === 'auth' && !state.githubService && user) {
    // We'll get the token from Firebase auth when needed
    updateState({
      currentStep: 'repository'
    });
  }

  const steps = [
    { id: 'auth', label: 'Authenticate', icon: Github },
    { id: 'repository', label: 'Select Repository', icon: GitBranch },
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'operations', label: 'Push Changes', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === state.currentStep);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
      
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
            <header className="flex justify-between items-center mb-10">
              <div className="flex items-center">
                <div className="p-4 bg-white rounded-2xl border border-green-200 shadow-sm">
                  <img 
                    src="/favicon.svg" 
                    alt="GitHub Bridge Logo" 
                    className="h-10 w-10"
                  />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">GitHub Bridge</h1>
                  <p className="text-sm text-gray-600">Upload Bolt.new projects to GitHub</p>
                </div>
              </div>
          {isAuthenticated && <UserProfile />}
        </header>

        {/* Step Indicator */}
        {isAuthenticated && (
            <nav aria-label="Progress" className="mb-10">
            <StepIndicator 
              steps={steps}
              currentStep={currentStepIndex}
            />
          </nav>
        )}

        {/* Main Content */}
            <main className="card p-8 sm:p-10" role="main">
          {!isAuthenticated && (
            <AuthPage
              onAuthSuccess={handleAuthSuccess}
            />
          )}

          {isAuthenticated && state.currentStep === 'repository' && state.githubService && (
            <RepositoryStep
             key={state.currentStep}
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
              onStartOver={handleStartOver}
              onBack={() => updateState({ currentStep: 'upload' })}
            />
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
