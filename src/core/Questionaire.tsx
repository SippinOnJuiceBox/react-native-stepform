import React, { useCallback, useRef } from "react";
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	TouchableOpacity,
	StyleSheet,
} from "react-native";

import { ContinueButton } from "./components";
import ProgressBar from "./components/ProgressBar";
import useQuestionnaire from "./hooks/useQuestionnaire";
import { Registry } from "./types/QuestionComponents";
import type {
	QuestionConfig,
	QuestionQuestion,
	QuestionComponentProps,
} from "./types/question";
import AnimatedQuestion from "./animations/AnimatedQuestion";
import type { AnimationPresetType } from "./animations/presets";

interface QuestionnaireProps {
	/** Configuration object defining all steps and questions in the questionnaire */
	config: QuestionConfig;

	/** Callback fired when questionnaire is completed. Receives complete form data */
	onCompleted: (formData: Record<string, unknown>) => Promise<void>;

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
	initialValues?: Record<string, unknown>;

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
		defaultRender: (question: QuestionQuestion) => React.ReactNode,
	) => React.ReactNode;

	/**
	 * Custom footer renderer. Receives navigation handlers and step state.
	 * Use to customize navigation buttons and progress display.
	 */
	renderFooter?: (props: {
		onNext: () => void;
		isValid: boolean;
		isSubmittingStep: boolean;
		isProcessingField: boolean;
		currentStep: number;
		totalSteps: number;
		onBack: () => void;
	}) => React.ReactNode;

	/** Enable debug logging of form data on continue */
	debug?: boolean;

	/** Animation preset to use for transitions */
	animationPreset?: AnimationPresetType;
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
	onExit,
	debug = false,
	animationPreset,
}: QuestionnaireProps) {
	// Register any custom components
	const isInitialRender = useRef(true);

	// Use our unified hook for all questionnaire functionality
	const {
		currentStep,
		currentStepData,
		formData,
		handleNext,
		handleBack,
		handleInputChange,
		isStepValid,
		isSubmittingStep,
		isProcessingField,
		isForward,
		errors,
		totalSteps,
		// We extract these but don't use them directly in this component
		// They're available for custom renderers if needed
		// validateStep,
		// setFieldDirty,
	} = useQuestionnaire({
		config,
		initialStep,
		initialValues,
		onCompleted,
		onStepChange,
		onBeforeNext,
		onBeforeBack,
		onExit,
		debug,
		animationPreset,
	});

	// Register custom components on initial render
	React.useEffect(() => {
		if (isInitialRender.current && customQuestionComponents) {
			// Using for...of instead of forEach for better performance
			for (const [type, component] of Object.entries(
				customQuestionComponents,
			)) {
				Registry.register(type, component);
			}
			isInitialRender.current = false;
		}
	}, [customQuestionComponents]);

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
					" Did you forget to import the component?",
				);
				return null;
			}
		},
		[formData, handleInputChange, errors],
	);

	return (
		<SafeAreaView style={styles.container}>
			{!hideHeader &&
				(renderHeader ? (
					renderHeader({
						currentStep,
						totalSteps,
						onBack: handleBack,
					})
				) : (
					<View style={styles.header}>
						{currentStep > 0 && (
							<TouchableOpacity onPress={handleBack} style={styles.backButton}>
								<Text>Back</Text>
							</TouchableOpacity>
						)}
						<View style={styles.progressBarContainer}>
							<ProgressBar current={currentStep} total={totalSteps} />
						</View>
					</View>
				))}

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
				style={styles.keyboardView}
			>
				<AnimatedQuestion
					isForward={isForward}
					animationPreset={animationPreset}
				>
					<View style={styles.contentContainer}>
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
					</View>
				</AnimatedQuestion>

				<View style={styles.bottomSection}>
					{renderFooter ? (
						renderFooter({
							currentStep,
							totalSteps,
							onNext: handleNext,
							isValid: isStepValid(),
							isSubmittingStep,
							isProcessingField,
							onBack: handleBack,
						})
					) : (
						<ContinueButton
							onPress={handleNext}
							disabled={!isStepValid() || isProcessingField || isSubmittingStep}
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
