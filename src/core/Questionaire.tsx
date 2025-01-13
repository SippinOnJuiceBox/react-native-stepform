import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import "./components/index";

import { ContinueButton, ProgressBar } from "./components";
import { useQuestionnaireAnimation } from "./hooks/useQuestionaireAnimation";
import { useQuestionnaireValidation } from "./hooks/useQuestionaireValidation";
import { Registry } from "./types/QuestionComponents";
import {
  QuestionConfig,
  QuestionQuestion,
  QuestionComponentProps,
} from "./types/question";

interface QuestionnaireProps {
  /** Configuration object defining all steps and questions in the questionnaire */
  config: QuestionConfig;

  /** Callback fired when questionnaire is completed. Receives complete form data */
  onCompleted: (formData: Record<string, any>) => Promise<void>;

  /** Optional callback fired whenever the current step changes */
  onStepChange?: (currentStep: number) => void;

  /** Starting step index. Defaults to 0 */
  initialStep?: number;

  /** Optional map of custom question components to override defaults */
  customQuestionComponents?: Record<
    string,
    React.ComponentType<QuestionComponentProps>
  >;

  /** Whether to hide the default header with back button and progress indicator */
  hideHeader?: boolean;

  /** Initial form values to pre-populate fields */
  initialValues?: Record<string, any>;

  /**
   * Optional async validation before proceeding to next step.
   * Return true to allow navigation, false to prevent
   */
  onBeforeNext?: (
    currentStep: number,
    formData: Record<string, any>
  ) => Promise<boolean>;

  /**
   * Optional async validation before going back.
   * Return true to allow navigation, false to prevent
   */
  onBeforeBack?: (currentStep: number) => Promise<boolean>;

  /**
   * Optional function to programmatically control current step.
   * Receives setState function to update step index
   */
  goToStep?: (setStep: (step: number) => void) => void;

  /**
   * Callback fired when user attempts to exit the questionnaire
   */
  onExit?: () => void;

  /**
   * Custom header renderer. Receives current step info and back handler.
   * Only used if hideHeader is false.
   */
  renderHeader?: (props: {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
  }) => React.ReactNode;

  /**
   * Custom question renderer. Receives question config and default renderer.
   * Use to customize individual question display.
   */
  renderQuestion?: (
    question: QuestionQuestion,
    defaultRender: (question: QuestionQuestion) => React.ReactNode
  ) => React.ReactNode;

  /**
   * Custom footer renderer. Receives navigation handlers and step state.
   * Use to customize navigation buttons and progress display.
   */
  renderFooter?: (props: {
    onNext: () => void;
    isValid: boolean;
    isProcessing: boolean;
    isUploading: boolean;
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
  }) => React.ReactNode;

  /** Enable debug logging of form data on continue */
  debug?: boolean;
}

export default function Questionnaire({
  config,
  onCompleted,
  onStepChange,
  onBeforeBack,
  onBeforeNext,
  initialStep = 0,
  customQuestionComponents = {},
  hideHeader,
  initialValues = {},
  renderHeader,
  renderQuestion,
  renderFooter,
  goToStep,
  onExit,
  debug = false,
}: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepHistory, setStepHistory] = useState<
    Record<number, Record<string, any>>
  >({
    [initialStep]: initialValues,
  });

  const isInitialRender = useRef(true);

  const { fadeAnim, fadeOut, fadeIn } = useQuestionnaireAnimation();
  const { isStepValid, validateStep, errors, setFieldDirty } =
    useQuestionnaireValidation(config[currentStep], formData);

  const handleBack = useCallback(async () => {
    if (currentStep > 0) {
      // Check if we can go back
      if (onBeforeBack) {
        const canGoBack = await onBeforeBack(currentStep);
        if (!canGoBack) return;
      }

      fadeOut();
      setTimeout(() => {
        const previousStep = currentStep - 1;
        setCurrentStep(previousStep);
        if (stepHistory[previousStep]) {
          setFormData(stepHistory[previousStep]);
        }
        fadeIn();
      }, 200);
    } else {
      onExit?.();
    }
  }, [currentStep, fadeOut, fadeIn, stepHistory, onBeforeBack]);

  const currentStepData = useMemo(
    () => config[currentStep],
    [config, currentStep]
  );

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialValues }));
      setStepHistory((prev) => ({
        ...prev,
        [currentStep]: { ...prev[currentStep], ...initialValues },
      }));
    }
  }, [initialValues, currentStep]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (stepHistory[currentStep]) {
      validateStep();
    }
  }, [currentStep, validateStep, stepHistory]);

  useEffect(() => {
    if (goToStep) {
      goToStep(setCurrentStep);
    }
  }, [goToStep]);

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const handleInputChange = useCallback(
    (name: string, value: any, uploading: boolean = false) => {
      setFormData((prev) => {
        const newFormData = { ...prev, [name]: value };
        setStepHistory((prevHistory) => ({
          ...prevHistory,
          [currentStep]: newFormData,
        }));
        return newFormData;
      });
      setFieldDirty(name);
      setIsUploading(uploading);
    },
    [currentStep, setFieldDirty]
  );

  const handleNext = useCallback(async () => {
    if (validateStep()) {
      // Check if we can proceed
      if (debug) {
        console.log({
          step: currentStep,
          allData: formData,
        });
      }
      if (onBeforeNext) {
        const canProceed = await onBeforeNext(currentStep, formData);
        if (!canProceed) return;
      }

      fadeOut();
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (currentStep < config.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        if (stepHistory[nextStep]) {
          setFormData(stepHistory[nextStep]);
        }
      } else {
        setIsProcessing(true);
        try {
          await onCompleted(formData);
        } catch (error) {
          console.error(error);
        } finally {
          setIsProcessing(false);
        }
      }
      fadeIn();
    }
  }, [
    currentStep,
    config.length,
    formData,
    fadeOut,
    fadeIn,
    validateStep,
    onCompleted,
    stepHistory,
    onBeforeNext,
    debug,
    config,
  ]);

  const defaultQuestionRenderer = useCallback(
    (question: QuestionQuestion) => {
      try {
        const QuestionComponent = Registry.get(question.type);

        const commonProps = {
          question,
          onChange: handleInputChange,
          value: formData[question.name],
          error: errors[question.name],
        };

        return <QuestionComponent {...commonProps} />;
      } catch (error) {
        console.error(
          `Error rendering question type "${question.type}":`,
          error,
          " Did you forget to import the component?"
        );
        return null;
      }
    },
    [formData, handleInputChange, errors]
  );

  return (
    <SafeAreaView style={styles.container}>
      {!hideHeader && (
        <>
          {renderHeader ? (
            renderHeader({
              currentStep,
              totalSteps: config.length,
              onBack: handleBack,
            })
          ) : (
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text>Back</Text>
              </TouchableOpacity>
              <View style={styles.progressBarContainer}>
                <ProgressBar current={currentStep} total={config.length} />
              </View>
            </View>
          )}
        </>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[styles.contentContainer, { opacity: fadeAnim }]}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.topSection}>
            <Text style={styles.pageHeader} accessibilityRole="header">
              {currentStepData.pageHeader}
            </Text>

            {currentStepData.pageSubheader && (
              <Text style={styles.pageSubheader}>
                {currentStepData.pageSubheader}
              </Text>
            )}
          </View>

          <View style={styles.middleSection}>
            {currentStepData.questions.map((question, index) => (
              <View
                key={`${question.name}-${index}`}
                style={styles.questionContainer}
              >
                {renderQuestion
                  ? renderQuestion(question, defaultQuestionRenderer)
                  : defaultQuestionRenderer(question)}
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSection}>
          {renderFooter ? (
            renderFooter({
              currentStep,
              totalSteps: config.length,
              onNext: handleNext,
              isValid: isStepValid,
              isProcessing,
              isUploading,
              onBack: handleBack,
            })
          ) : (
            <ContinueButton
              onPress={handleNext}
              disabled={!isStepValid || isUploading || isProcessing}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginRight: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  progressBarContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topSection: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  middleSection: {
    flex: 1,
  },
  bottomSection: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 0 : 16,
  },
  pageHeader: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1f2937",
  },
  pageSubheader: {
    marginTop: 8,
    fontSize: 16,
    color: "#4b5563",
  },
  questionContainer: {
    marginTop: 8,
  },
});
