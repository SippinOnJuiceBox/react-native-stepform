import { useCallback } from "react";

/**
 * Hook for managing questionnaire navigation with animations
 *
 * @param {number} currentStep - Current step index in the questionnaire
 * @param {() => void} fadeOut - Animation function for fading out content
 * @param {() => void} fadeIn - Animation function for fading in content
 * @param {(step: number) => void} setCurrentStep - Function to update current step
 * @param {() => void} onExit - Callback fired when user attempts to exit
 *
 * @returns {Object} Navigation controls
 * @property {() => void} handleBack - Function to handle back navigation
 */
export const useQuestionnaireNavigation = (
  currentStep: number,
  fadeOut: () => void,
  fadeIn: () => void,
  setCurrentStep: (step: number) => void,
  onExit?: () => void
) => {
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      fadeOut();
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        fadeIn();
      }, 200);
    } else {
      onExit?.();
    }
  }, [currentStep, fadeOut, fadeIn, setCurrentStep, onExit]);

  return { handleBack };
};
