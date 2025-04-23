import { useEffect, memo } from "react";
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
}

/**
 * AnimatedQuestion component that animates its children when they change
 * Uses animation presets to provide different transition effects
 */
function AnimatedQuestion({ 
  children, 
  isForward, 
  animationPreset = DEFAULT_ANIMATION_PRESET 
}: AnimatedQuestionProps) {
  // Get the selected animation preset
  const preset = ANIMATION_PRESETS[animationPreset];
  
  // Initialize animation values
  const values = preset.initialize(isForward);
  
  // Run animation when direction or children change
  useEffect(() => {
    // Start the enter animation
    preset.enter(values);
    
    // Return cleanup function that runs the exit animation
    return () => {
      preset.exit(values);
    };
  }, [preset, values]);
  
  // Create animated style
  const animatedStyle = preset.createAnimatedStyle(values);
  
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
