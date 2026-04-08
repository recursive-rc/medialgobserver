import { useState, useCallback, useMemo } from 'react';
import type { AlgorithmStep } from '../types/algorithm';

export function useAlgorithm<T>(steps: AlgorithmStep<T>[]) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    setCurrentStepIndex(Math.max(0, Math.min(index, totalSteps - 1)));
  }, [totalSteps]);

  const currentStep = useMemo(() => steps[currentStepIndex], [steps, currentStepIndex]);

  return {
    currentStepIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
  };
}
