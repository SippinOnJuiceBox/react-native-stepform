import { memo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from "react-native-reanimated";

/**
 * Props for the ProgressBar component
 */
interface ProgressBarProps {
	/** Progress value between 0 and 1 */
	progress: number;

	/** Height of the progress bar in pixels */
	height?: number;

	/** Background color of the progress bar container */
	backgroundColor?: string;

	/** Color of the progress indicator */
	progressColor?: string;

	/** Duration of the progress animation in milliseconds */
	animationDuration?: number;

	/** Additional style for the container */
	style?: object;
}

const PROGRESS_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

/**
 * An animated progress bar component that shows completion progress
 */
function ProgressBar({
	progress,
	height = 8,
	backgroundColor = "#f5f5f4",
	progressColor = "#44403c",
	animationDuration = 300,
	style,
}: ProgressBarProps) {
	const progressPercent = Math.min(Math.max(0, progress), 1) * 100;

	const widthPercent = useSharedValue(0);

	useEffect(() => {
		widthPercent.value = withTiming(progressPercent, {
			duration: animationDuration,
			easing: PROGRESS_EASING,
		});
	}, [progressPercent, animationDuration, widthPercent]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			width: `${widthPercent.value}%`,
			height: "100%",
			backgroundColor: progressColor,
		};
	});

	return (
		<View
			style={[
				styles.container,
				{
					height,
					backgroundColor,
				},
				style,
			]}
			accessibilityRole="progressbar"
			accessibilityValue={{
				min: 0,
				max: 100,
				now: progressPercent,
			}}
		>
			<Animated.View style={animatedStyle} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		overflow: "hidden",
		borderRadius: 4,
	},
});

export default memo(ProgressBar);
