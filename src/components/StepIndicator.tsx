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
    <div className="flex items-center justify-between pb-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const IconComponent = step.icon;

        return (
          <div key={step.id} className="flex items-center min-w-0">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
              isCompleted
                ? 'bg-green-600 border-green-600 text-white'
                : isActive
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-gray-300 text-gray-400'
            } flex-shrink-0`}>
              <IconComponent size={18} />
            </div>
            <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-semibold hidden sm:block truncate ${
              isActive
                ? 'text-green-600'
                : 'text-gray-500'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`flex-1 min-w-4 max-w-16 h-0.5 ml-2 sm:ml-4 mr-2 sm:mr-4 transition-colors ${
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