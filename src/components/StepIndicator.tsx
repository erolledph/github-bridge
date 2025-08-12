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
    <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const IconComponent = step.icon;

        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
              isCompleted
                ? 'bg-green-600 border-green-600 text-white'
                : isActive
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-gray-300 text-gray-400'
            }`}>
              <IconComponent size={16} />
            </div>
            <span className={`ml-2 text-xs sm:text-sm font-medium hidden sm:block whitespace-nowrap ${
              isActive
                ? 'text-green-600'
                : 'text-gray-500'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-6 sm:w-8 md:w-12 h-px ml-2 sm:ml-4 mr-2 sm:mr-4 ${
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