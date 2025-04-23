import { useEffect, memo, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import {
	ANIMATION_PRESETS,
	DEFAULT_ANIMATION_PRESET,
	type AnimationPresetType,
	ANIMATION_DURATIONS,
} from "./presets";

interface AnimatedQuestionProps {
	/**
	 * Content to be animated
	 */
	children: React.ReactNode;

	/**
	 * Whether the animation is moving forward or backward
	 */
	isForward: boolean;

	/**
	 * Animation preset to use
	 */
	animationPreset?: AnimationPresetType;

	/**
	 * Optional separate enter animation preset
	 */
	enterPreset?: AnimationPresetType;

	/**
	 * Optional separate exit animation preset
	 */
	exitPreset?: AnimationPresetType;

	/**
	 * Current step index for tracking changes
	 */
	currentStep: number;
}

/**
 * AnimatedQuestion component that animates its children when they change
 * Uses animation presets to provide different transition effects
 */
function AnimatedQuestion({
	children,
	isForward,
	animationPreset = DEFAULT_ANIMATION_PRESET,
	enterPreset,
	exitPreset,
	currentStep,
}: AnimatedQuestionProps) {
	const [prevStep, setPrevStep] = useState(currentStep);
	const [visibleContent, setVisibleContent] = useState(children);
	const mainPreset = ANIMATION_PRESETS[animationPreset];
	const enterAnimPreset = enterPreset
		? ANIMATION_PRESETS[enterPreset]
		: mainPreset;
	const exitAnimPreset = exitPreset
		? ANIMATION_PRESETS[exitPreset]
		: mainPreset;

	const values = mainPreset.initialize(isForward);

	useEffect(() => {
		if (prevStep !== currentStep) {
			exitAnimPreset.exit(values);

			const timeout = setTimeout(() => {
				setVisibleContent(children);
				setPrevStep(currentStep);
				enterAnimPreset.enter(values);
			}, ANIMATION_DURATIONS.fadeOut);

			return () => clearTimeout(timeout);
		}

		setVisibleContent(children);
		enterAnimPreset.enter(values);
	}, [
		currentStep,
		enterAnimPreset,
		exitAnimPreset,
		prevStep,
		values,
		children,
	]);

	const animatedStyle = mainPreset.createAnimatedStyle(values);

	return (
		<View style={styles.container}>
			<Animated.View style={[styles.content, animatedStyle]}>
				{visibleContent}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		overflow: "hidden",
	},
	content: {
		flex: 1,
	},
});

export default memo(AnimatedQuestion);
