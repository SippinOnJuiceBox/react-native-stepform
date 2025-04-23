import { useEffect, memo, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { 
  ANIMATION_PRESETS, 
  DEFAULT_ANIMATION_PRESET, 
  type AnimationPresetType 
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
  currentStep
}: AnimatedQuestionProps) {
  // Track the previous step to detect changes
  const [prevStep, setPrevStep] = useState(currentStep);
  
  // Get the selected animation presets
  const mainPreset = ANIMATION_PRESETS[animationPreset];
  const enterAnimPreset = enterPreset ? ANIMATION_PRESETS[enterPreset] : mainPreset;
  const exitAnimPreset = exitPreset ? ANIMATION_PRESETS[exitPreset] : mainPreset;
  
  // Initialize animation values
  const values = mainPreset.initialize(isForward);
  
  // Run animation when step changes
  useEffect(() => {
    // If the step has changed, trigger animations
    if (prevStep !== currentStep) {
      // First run exit animation
      exitAnimPreset.exit(values);
      
      // Then after a delay, update the step and run enter animation
      const timeout = setTimeout(() => {
        setPrevStep(currentStep);
        enterAnimPreset.enter(values);
      }, 300); // Match this with the exit animation duration
      
      return () => clearTimeout(timeout);
    }
    
    // Initial render or after step update - run enter animation
    enterAnimPreset.enter(values);
  }, [currentStep, enterAnimPreset, exitAnimPreset, prevStep, values]);
  
  // Create animated style
  const animatedStyle = mainPreset.createAnimatedStyle(values);
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
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

// Memoize the component for better performance
export default memo(AnimatedQuestion);
