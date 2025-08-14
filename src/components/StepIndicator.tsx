import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between pb-6">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const IconComponent = step.icon;

        return (
          <div key={step.id} className="flex items-center min-w-0">
            <div className={`flex items-center justify-center w-14 h-14 rounded-full border-3 transition-all duration-300 shadow-sm ${
              isCompleted
                ? 'bg-green-600 border-green-600 text-white shadow-green-200'
                : isActive
                ? 'border-green-600 bg-green-600 text-white shadow-green-200'
                : 'border-gray-300 text-gray-400 bg-white'
            } flex-shrink-0`}>
              <IconComponent size={20} />
            </div>
            <span className={`ml-3 sm:ml-4 text-sm sm:text-base font-bold hidden sm:block truncate ${
              isActive
                ? 'text-green-600'
                : 'text-gray-500'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`flex-1 min-w-4 max-w-20 h-1 ml-3 sm:ml-5 mr-3 sm:mr-5 transition-colors rounded-full ${
                index < currentStep
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};