import type React from "react";
import { useCallback, useRef } from "react";
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
	QuestionStep,
} from "./types/question";
import AnimatedQuestion from "./animations/AnimatedQuestion";
import type { AnimationPresetType } from "./animations/presets";

interface QuestionnaireProps {
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

	/** Optional separate enter animation preset */
	enterPreset?: AnimationPresetType;

	/** Optional separate exit animation preset */
	exitPreset?: AnimationPresetType;

	/** Optional map of custom question components to override defaults */
	customQuestionComponents?: Record<
		string,
		React.ComponentType<QuestionComponentProps>
	>;

	/** Whether to hide the default header with back button and progress indicator */
	hideHeader?: boolean;

	/**
	 * Custom header renderer. Receives current step info and navigation handlers.
	 * Only used if hideHeader is false.
	 */
	renderHeader?: (props: {
		currentStep: number;
		totalSteps: number;
		handleNext: () => void;
		handleSkip: () => void;
		handleBack: () => void;
		handleExit: () => void;
		isValid: boolean;
		isSubmittingStep: boolean;
		isProcessingField: boolean;
		hasSkippableQuestions: boolean;
		currentStepData: QuestionStep;
		formData: Record<string, unknown>;
		errors: Record<string, string>;
		handleInputChange: (name: string, value: unknown) => void;
	}) => React.ReactNode;

	/**
	 * Custom question renderer. Receives question data and default renderer.
	 */
	renderQuestion?: (
		question: QuestionQuestion,
		defaultRender: (question: QuestionQuestion) => React.ReactNode,
	) => React.ReactNode;

	/**
	 * Custom footer renderer. Receives navigation handlers and state.
	 */
	renderFooter?: (props: {
		currentStep: number;
		totalSteps: number;
		handleNext: () => void;
		handleSkip: () => void;
		isValid: boolean;
		isSubmittingStep: boolean;
		isProcessingField: boolean;
		handleBack: () => void;
		handleExit: () => void;
		hasSkippableQuestions: boolean;
		currentStepData: QuestionStep;
		formData: Record<string, unknown>;
		errors: Record<string, string>;
		handleInputChange: (name: string, value: unknown) => void;
	}) => React.ReactNode;
}

export default function Questionnaire({
	config,
	initialStep = 0,
	initialValues = {},
	onCompleted,
	onStepChange,
	onBeforeNext,
	onBeforeBack,
	customQuestionComponents,
	hideHeader = false,
	renderHeader,
	renderQuestion,
	renderFooter,
	onExit,
	debug = false,
	animationPreset,
	enterPreset,
	exitPreset,
}: QuestionnaireProps) {
	// Register any custom components
	const isInitialRender = useRef(true);

	// Use the unified questionnaire hook
	const {
		currentStep,
		totalSteps,
		currentStepData,
		formData,
		errors,
		isForward,
		isStepValid,
		isSubmittingStep,
		isProcessingField,
		hasSkippableQuestions,
		handleInputChange,
		handleNext,
		handleBack,
		handleSkip,
		handleExit,
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
	if (isInitialRender.current && customQuestionComponents) {
		for (const [type, component] of Object.entries(customQuestionComponents)) {
			Registry.register(type, component);
		}
		isInitialRender.current = false;
	}

	// Render a question based on its type
	const renderQuestionByType = useCallback(
		(question: QuestionQuestion) => {
			const Component = Registry.get(question.type);

			if (!Component) {
				console.warn(
					`No component registered for question type: ${question.type}`,
				);
				return null;
			}

			const value = formData[question.name];
			const error = errors[question.name];

			return (
				<Component
					key={question.name}
					question={question}
					value={value}
					onChange={handleInputChange}
					error={error}
				/>
			);
		},
		[errors, formData, handleInputChange],
	);

	// Platform-specific keyboard avoiding behavior
	const keyboardBehavior = Platform.OS === "ios" ? "padding" : undefined;

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={styles.keyboardAvoidingView}
				behavior={keyboardBehavior}
				keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
			>
				<View style={styles.contentContainer}>
					<View style={styles.topSection}>
						{!hideHeader && (
							<View style={styles.header}>
								{renderHeader ? (
									renderHeader({
										currentStep,
										totalSteps,
										handleNext,
										handleSkip,
										handleBack,
										handleExit,
										isValid: isStepValid(),
										isSubmittingStep,
										isProcessingField,
										hasSkippableQuestions,
										currentStepData,
										formData,
										errors,
										handleInputChange,
									})
								) : (
									<>
										<View style={styles.headerControls}>
											<TouchableOpacity
												onPress={handleBack}
												style={styles.backButton}
												accessibilityRole="button"
												accessibilityLabel={currentStep > 0 ? "Go back" : "Exit"}
											>
												<Text style={styles.backButtonText}>Back</Text>
											</TouchableOpacity>

											<ProgressBar
												progress={(currentStep + 1) / totalSteps}
												height={6}
												backgroundColor="#f5f5f4"
												progressColor="#78716c"
												style={styles.progressBar}
											/>

											{hasSkippableQuestions ? (
												<TouchableOpacity
													onPress={handleSkip}
													style={styles.skipButton}
													accessibilityRole="button"
													accessibilityLabel="Skip this question"
												>
													<Text style={styles.skipButtonText}>Skip</Text>
												</TouchableOpacity>
											) : (
												<View style={styles.buttonPlaceholder} />
											)}
										</View>
									</>
								)}
							</View>
						)}
					</View>

					<AnimatedQuestion
						isForward={isForward}
						animationPreset={animationPreset}
						enterPreset={enterPreset}
						exitPreset={exitPreset}
						currentStep={currentStep}
					>
						<View style={styles.questionsContainer}>
							{currentStepData.questions.map((question) =>
								renderQuestion
									? renderQuestion(question, renderQuestionByType)
									: renderQuestionByType(question),
							)}
						</View>
					</AnimatedQuestion>

					<View style={styles.bottomSection}>
						{renderFooter ? (
							renderFooter({
								currentStep,
								totalSteps,
								handleNext,
								handleSkip,
								isValid: isStepValid(),
								isSubmittingStep,
								isProcessingField,
								handleBack,
								handleExit,
								hasSkippableQuestions,
								currentStepData,
								formData,
								errors,
								handleInputChange,
							})
						) : (
							<>
								<ContinueButton
									onPress={handleNext}
									disabled={
										!isStepValid() || isProcessingField || isSubmittingStep
									}
								/>
							</>
						)}
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	keyboardAvoidingView: {
		flex: 1,
	},
	contentContainer: {
		flex: 1,
		padding: 24,
		justifyContent: "space-between",
	},
	topSection: {
		marginBottom: 24,
	},
	header: {
		marginBottom: 24,
	},
	headerControls: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
	},
	progressBar: {
		width: "60%",
	},
	buttonPlaceholder: {
		width: 40,
		height: 32,
	},
	backButton: {
		width: 40,
		height: 32,
		alignItems: "flex-start",
		justifyContent: "center",
	},
	backButtonText: {
		fontSize: 16,
		color: "#78716c",
	},
	skipButton: {
		width: 40,
		height: 32,
		alignItems: "flex-end",
		justifyContent: "center",
	},
	skipButtonText: {
		fontSize: 14,
		color: "#78716c",
	},
	questionsContainer: {
		flex: 1,
	},
	bottomSection: {
		marginTop: 24,
	},
});
