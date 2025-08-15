import React, { useState, useEffect } from 'react';
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
  showAuthTokenError: boolean;
}

function App() {
  const { user, isLoading, githubToken } = useAuth();
  const [state, setState] = useState<AppState>({
    currentStep: 'auth',
    selectedRepository: null,
    uploadedFile: null,
    githubService: null,
    showAuthTokenError: false,
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Centralized GitHub service initialization and token validation based on auth state
  useEffect(() => {
    // Only proceed once auth state is fully determined
    if (isLoading) return;

    const validateAndSetupGitHubService = async () => {
      if (user && githubToken) {
        // User is authenticated and has GitHub token - validate it
        try {
          const githubService = new GitHubService(githubToken);
          const validation = await githubService.validateToken();
          
          if (validation.valid && validation.username) {
            // Token is valid - proceed to repository step
            updateState({
              githubService,
              currentStep: 'repository',
              showAuthTokenError: false
            });
          } else {
            // Token is invalid - show error and stay on auth page
            updateState({
              githubService: null,
              currentStep: 'auth',
              showAuthTokenError: true
            });
          }
        } catch (error) {
          console.error('Token validation failed on refresh:', error);
          // Token validation failed - show error and stay on auth page
          updateState({
            githubService: null,
            currentStep: 'auth',
            showAuthTokenError: true
          });
        }
      } else if (user && !githubToken) {
        // User is authenticated but no GitHub token - show error
        updateState({
          githubService: null,
          currentStep: 'auth',
          showAuthTokenError: true
        });
      } else {
        // User is not authenticated - normal auth state
        updateState({
          githubService: null,
          currentStep: 'auth',
          showAuthTokenError: false
        });
      }
    };

    validateAndSetupGitHubService();
  }, [user, githubToken, isLoading]);

  const handleAuthSuccess = (token: string) => {
    const githubService = new GitHubService(token);
    updateState({
      githubService,
      currentStep: 'repository',
      showAuthTokenError: false
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
    // Reset to repository step but keep the GitHub service
    updateState({
      currentStep: 'repository',
      selectedRepository: null,
      uploadedFile: null,
      githubService: state.githubService, // Keep the existing GitHub service
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

  // Don't render repository step if we don't have a GitHub service
  const shouldShowRepositoryStep = isAuthenticated && 
    state.currentStep === 'repository' && 
    state.githubService;

  // Don't render upload step if we don't have a selected repository
  const shouldShowUploadStep = isAuthenticated && 
    state.currentStep === 'upload' && 
    state.selectedRepository;

  // Don't render operations step if we don't have all required data
  const shouldShowOperationsStep = isAuthenticated && 
    state.currentStep === 'operations' && 
    state.githubService && 
    state.selectedRepository && 
    state.uploadedFile;

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
          {state.currentStep === 'auth' && (
            <AuthPage
              onAuthSuccess={handleAuthSuccess}
              tokenError={state.showAuthTokenError}
            />
          )}

          {shouldShowRepositoryStep && (
            <RepositoryStep
             key={state.currentStep}
              githubService={state.githubService}
              onRepositorySelected={handleRepositorySelected}
              onBack={() => updateState({ currentStep: 'repository' })}
            />
          )}

          {shouldShowUploadStep && (
            <FileUploadStep
              onFileUploaded={handleFileUploaded}
              onBack={() => updateState({ currentStep: 'repository' })}
            />
          )}

          {shouldShowOperationsStep && (
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