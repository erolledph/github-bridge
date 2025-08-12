import React, { useState } from 'react';
import { AuthenticationStep } from './components/AuthenticationStep';
import RepositoryStep from './components/RepositoryStep';
import FileUploadStep from './components/FileUploadStep';
import { GitOperationsStep } from './components/GitOperationsStep';
import { StepIndicator } from './components/StepIndicator';
import { GitBranch, Upload, Settings, CheckCircle } from 'lucide-react';
import { GitHubService } from './services/GitHubService';
import { Repository, UploadedFile } from './types';

type Step = 'auth' | 'repository' | 'upload' | 'operations';

interface AppState {
  currentStep: Step;
  token: string;
  selectedRepository: Repository | null;
  uploadedFile: UploadedFile | null;
  githubService: GitHubService | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentStep: 'auth',
    token: '',
    selectedRepository: null,
    uploadedFile: null,
    githubService: null,
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleTokenValidated = (token: string, githubService: GitHubService) => {
    updateState({
      token,
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

  const steps = [
    { id: 'auth', label: 'Authenticate', icon: Settings },
    { id: 'repository', label: 'Select Repository', icon: GitBranch },
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'operations', label: 'Push Changes', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === state.currentStep);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              GitHub Bridge
            </h1>
            <p className="mt-2 text-gray-600">
              Upload your Bolt.new projects directly to GitHub repositories
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator 
          steps={steps}
          currentStep={currentStepIndex}
        />

        {/* Main Content */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          {state.currentStep === 'auth' && (
            <AuthenticationStep
              onTokenValidated={handleTokenValidated}
            />
          )}

          {state.currentStep === 'repository' && state.githubService && (
            <RepositoryStep
              githubService={state.githubService}
              onRepositorySelected={handleRepositorySelected}
              onBack={() => updateState({ currentStep: 'auth' })}
            />
          )}

          {state.currentStep === 'upload' && (
            <FileUploadStep
              onFileUploaded={handleFileUploaded}
              onBack={() => updateState({ currentStep: 'repository' })}
            />
          )}

          {state.currentStep === 'operations' && state.githubService && state.selectedRepository && state.uploadedFile && (
            <GitOperationsStep
              githubService={state.githubService}
              repository={state.selectedRepository}
              uploadedFile={state.uploadedFile}
              onComplete={handleOperationComplete}
              onBack={() => updateState({ currentStep: 'upload' })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;