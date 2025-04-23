import { useState, useEffect, useCallback, useMemo } from "react";
import { Animated } from "react-native";
import { z } from "zod";

import type { QuestionConfig } from "../types/question";
import type { AnimationPresetType } from "../animations/presets";
import {
	DEFAULT_ANIMATION_PRESET,
	ANIMATION_DURATIONS,
} from "../animations/presets";

interface UseQuestionnaireOptions {
	/** Configuration object defining all steps and questions in the questionnaire */
	config: QuestionConfig;

	/** Starting step index. Defaults to 0 */
	initialStep?: number;

	/** Initial form values to pre-populate fields */
	initialValues?: Record<string, unknown>;

	/** Optional callback fired when questionnaire is completed. Receives complete form data */
	onCompleted?: (formData: Record<string, unknown>) => Promise<void>;

	/** Optional callback fired whenever the current step changes */
	onStepChange?: (currentStep: number) => void;

	/**
	 * Optional async validation before proceeding to next step.
	 * Return true to allow navigation, false to prevent
	 */
	onBeforeNext?: (
		currentStep: number,
		formData: Record<string, unknown>,
	) => Promise<boolean>;

	/**
	 * Optional async validation before going back.
	 * Return true to allow navigation, false to prevent
	 */
	onBeforeBack?: (currentStep: number) => Promise<boolean>;

	/**
	 * Callback fired when user attempts to exit the questionnaire
	 */
	onExit?: () => void;

	/** Enable debug logging of form data on continue */
	debug?: boolean;

	/** Animation preset to use for transitions */
	animationPreset?: AnimationPresetType;
}

/**
 * A unified hook that manages the complete questionnaire experience
 * including navigation, animation, validation, and state management.
 *
 * @returns An object containing all questionnaire state and controls
 */
function useQuestionnaire({
	config,
	initialStep = 0,
	initialValues = {},
	onCompleted,
	onStepChange,
	onBeforeNext,
	onBeforeBack,
	onExit,
	debug = false,
	animationPreset = DEFAULT_ANIMATION_PRESET,
}: UseQuestionnaireOptions) {
	const [currentStep, setCurrentStep] = useState(initialStep);
	const [formData, setFormData] =
		useState<Record<string, unknown>>(initialValues);
	const [isForward, setIsForward] = useState(true);
	const [isSubmittingStep, setIsSubmittingStep] = useState(false);
	const [isProcessingField, setIsProcessingField] = useState(false);
	const [stepHistory, setStepHistory] = useState<
		Record<number, Record<string, unknown>>
	>({
		[initialStep]: initialValues,
	});
	const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [fadeAnim] = useState(new Animated.Value(1));

	const currentStepData = useMemo(
		() => config[currentStep],
		[config, currentStep],
	);

	const fadeOut = useCallback(() => {
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: ANIMATION_DURATIONS.fadeOut,
			useNativeDriver: true,
		}).start();
	}, [fadeAnim]);

	const fadeIn = useCallback(() => {
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: ANIMATION_DURATIONS.fadeIn,
			useNativeDriver: true,
		}).start();
	}, [fadeAnim]);

	const createValidationSchema = useCallback(() => {
		return z.object(
			currentStepData.questions.reduce(
				(acc, question) => {
					if (question.validation) {
						acc[question.name] = question.validation;
					}
					return acc;
				},
				{} as Record<string, z.ZodType>,
			),
		);
	}, [currentStepData]);

	const validateStep = useCallback(() => {
		if (currentStepData.questions.every((q) => !q.validation)) {
			setErrors({});
			return true;
		}

		const allFieldsDirty = currentStepData.questions.reduce(
			(acc, question) => {
				acc[question.name] = true;
				return acc;
			},
			{} as Record<string, boolean>,
		);
		setDirtyFields(allFieldsDirty);

		const schema = createValidationSchema();

		try {
			schema.parse(formData);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors = error.errors.reduce(
					(acc, curr) => {
						const field = curr.path[0] as string;
						acc[field] = curr.message;
						return acc;
					},
					{} as Record<string, string>,
				);
				setErrors(newErrors);
			}
			return false;
		}
	}, [createValidationSchema, currentStepData.questions, formData]);

	const isStepValid = useCallback(() => {
		if (currentStepData.questions.every((q) => !q.validation)) {
			return true;
		}

		if (currentStepData.questions.every((q) => q.skippable)) {
			return true;
		}

		const schema = createValidationSchema();

		try {
			schema.parse(formData);
			return true;
		} catch {
			return false;
		}
	}, [createValidationSchema, currentStepData.questions, formData]);

	const handleBack = useCallback(async () => {
		if (currentStep > 0) {
			if (onBeforeBack) {
				const canGoBack = await onBeforeBack(currentStep);
				if (!canGoBack) return;
			}

			setIsForward(false);
			fadeOut();
			await new Promise((resolve) =>
				setTimeout(resolve, ANIMATION_DURATIONS.fadeOut),
			);

			const previousStep = currentStep - 1;
			setCurrentStep(previousStep);

			if (stepHistory[previousStep]) {
				setFormData(stepHistory[previousStep]);
			}

			fadeIn();
		} else {
			onExit?.();
		}
	}, [currentStep, fadeOut, fadeIn, stepHistory, onBeforeBack, onExit]);

	const handleNext = useCallback(async () => {
		if (validateStep()) {
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

			setIsForward(true);
			fadeOut();
			await new Promise((resolve) =>
				setTimeout(resolve, ANIMATION_DURATIONS.fadeOut),
			);

			if (currentStep < config.length - 1) {
				const nextStep = currentStep + 1;
				setCurrentStep(nextStep);

				if (stepHistory[nextStep]) {
					setFormData(stepHistory[nextStep]);
				}
			} else {
				setIsSubmittingStep(true);
				try {
					await onCompleted?.(formData);
				} catch (error) {
					console.error("Error completing questionnaire:", error);
				} finally {
					setIsSubmittingStep(false);
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
	]);

	const handleSkip = useCallback(async () => {
		if (onBeforeNext) {
			const canProceed = await onBeforeNext(currentStep, formData);
			if (!canProceed) return;
		}

		setIsForward(true);
		fadeOut();
		await new Promise((resolve) =>
			setTimeout(resolve, ANIMATION_DURATIONS.fadeOut),
		);

		if (currentStep < config.length - 1) {
			const nextStep = currentStep + 1;
			setCurrentStep(nextStep);

			if (!stepHistory[nextStep]) {
				setStepHistory((prev) => ({
					...prev,
					[nextStep]: prev[nextStep] || {},
				}));
			}
		} else {
			setIsSubmittingStep(true);
			try {
				await onCompleted?.(formData);
			} catch (error) {
				console.error("Error completing questionnaire:", error);
			} finally {
				setIsSubmittingStep(false);
			}
		}

		fadeIn();
	}, [
		currentStep,
		config.length,
		formData,
		fadeOut,
		fadeIn,
		onCompleted,
		stepHistory,
		onBeforeNext,
	]);

	const handleInputChange = useCallback(
		(name: string, value: unknown, uploading = false) => {
			setFormData((prev) => {
				const newFormData = { ...prev, [name]: value };

				setStepHistory((prevHistory) => ({
					...prevHistory,
					[currentStep]: newFormData,
				}));

				return newFormData;
			});

			setDirtyFields((prev) => ({ ...prev, [name]: true }));

			setIsProcessingField(uploading);
		},
		[currentStep],
	);

	useEffect(() => {
		setDirtyFields({});
	}, []);

	useEffect(() => {
		if (Object.keys(dirtyFields).length === 0) return;
		if (currentStepData.questions.every((q) => !q.validation)) {
			setErrors({});
			return;
		}

		const schema = createValidationSchema();

		try {
			schema.parse(formData);
			setErrors({});
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors = error.errors.reduce(
					(acc, curr) => {
						const field = curr.path[0] as string;
						if (dirtyFields[field]) {
							acc[field] = curr.message;
						}
						return acc;
					},
					{} as Record<string, string>,
				);
				setErrors(newErrors);
			}
		}
	}, [
		formData,
		createValidationSchema,
		currentStepData.questions,
		dirtyFields,
	]);

	useEffect(() => {
		onStepChange?.(currentStep);
	}, [currentStep, onStepChange]);

	useEffect(() => {
		if (Object.keys(initialValues).length > 0) {
			setFormData((prev) => ({ ...prev, ...initialValues }));
			setStepHistory((prev) => ({
				...prev,
				[currentStep]: { ...prev[currentStep], ...initialValues },
			}));
		}
	}, [initialValues, currentStep]);

	const hasSkippableQuestions = useMemo(() => {
		return currentStepData.questions.some((q) => q.skippable);
	}, [currentStepData.questions]);

	return {
		currentStep,
		currentStepData,
		formData,
		isStepValid,
		isForward,
		isSubmittingStep,
		isProcessingField,
		errors,
		totalSteps: config.length,
		hasSkippableQuestions,
		fadeAnim,
		animationPreset,
		handleNext,
		handleBack,
		handleSkip,
		handleInputChange,
		validateStep,
		setFieldDirty: (fieldName: string) => {
			setDirtyFields((prev) => ({ ...prev, [fieldName]: true }));
		},
		goToStep: (step: number) => {
			if (step >= 0 && step < config.length) {
				setCurrentStep(step);
			}
		},
	};
}

export default useQuestionnaire;
