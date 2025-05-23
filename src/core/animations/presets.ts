import type { SharedValue } from "react-native-reanimated";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

// Spring configuration for natural-feeling animations
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 90,
  mass: 0.5,
  overshootClamping: false,
};

// Timing configuration for smoother animations
const TIMING_CONFIG = {
  duration: 200,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

// Animation durations
export const ANIMATION_DURATIONS = {
  fadeIn: 150,
  fadeOut: 200,
};

/**
 * Available animation preset types
 * 
 * @description These are the available animation presets for transitions between questions
 * 
 * - `fade`: Simple fade in/out animation
 * - `slideUp`: Content slides up (forward) or down (backward)
 * - `slideLeft`: Content slides left (forward) or right (backward)
 * - `slideRight`: Content slides right (forward) or left (backward)
 * - `scale`: Content scales up/down with fade
 * - `fadeSlideUp`: Content fades while sliding up/down (default)
 * - `fadeScale`: Content fades while scaling up/down
 */
export const AnimationPresets = {
  /** Simple fade in/out animation */
  fade: "fade",
  /** Content slides up (forward) or down (backward) */
  slideUp: "slideUp",
  /** Content slides left (forward) or right (backward) */
  slideLeft: "slideLeft",
  /** Content slides right (forward) or left (backward) */
  slideRight: "slideRight",
  /** Content scales up/down with fade */
  scale: "scale",
  /** Content fades while sliding up/down (default) */
  fadeSlideUp: "fadeSlideUp",
  /** Content fades while scaling up/down */
  fadeScale: "fadeScale",
} as const;

/**
 * Animation preset type
 * 
 * Use with animationPreset, enterPreset, or exitPreset props
 */
export type AnimationPresetType = typeof AnimationPresets[keyof typeof AnimationPresets];

/**
 * Animation preset configuration
 */
export interface AnimationPreset {
  /**
   * Initialize animation values
   * @param isForward Whether the animation is moving forward or backward
   */
  initialize: (isForward: boolean) => {
    opacity?: SharedValue<number>;
    translateX?: SharedValue<number>;
    translateY?: SharedValue<number>;
    scale?: SharedValue<number>;
  };
  
  /**
   * Start the enter animation
   * @param values Animation values to animate
   */
  enter: (values: {
    opacity?: SharedValue<number>;
    translateX?: SharedValue<number>;
    translateY?: SharedValue<number>;
    scale?: SharedValue<number>;
  }) => void;
  
  /**
   * Start the exit animation
   * @param values Animation values to animate
   */
  exit: (values: {
    opacity?: SharedValue<number>;
    translateX?: SharedValue<number>;
    translateY?: SharedValue<number>;
    scale?: SharedValue<number>;
  }) => void;
  
  /**
   * Create animated style based on animation values
   * @param values Animation values
   */
  createAnimatedStyle: (values: {
    opacity?: SharedValue<number>;
    translateX?: SharedValue<number>;
    translateY?: SharedValue<number>;
    scale?: SharedValue<number>;
  }) => ReturnType<typeof useAnimatedStyle>;
}

/**
 * Fade animation preset
 * Simple fade in/out animation
 */
const fadePreset: AnimationPreset = {
  initialize: (_isForward) => ({
    opacity: useSharedValue(0),
  }),
  
  enter: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(1, TIMING_CONFIG);
    }
  },
  
  exit: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(0, TIMING_CONFIG);
    }
  },
  
  createAnimatedStyle: (values) => {
    return useAnimatedStyle(() => ({
      opacity: values.opacity?.value ?? 1,
    }));
  },
};

/**
 * Slide up animation preset
 * Content slides up from the bottom (forward) or down from the top (backward)
 */
const slideUpPreset: AnimationPreset = {
  initialize: (isForward) => ({
    opacity: useSharedValue(0),
    translateY: useSharedValue(isForward ? 40 : -40),
  }),
  
  enter: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(1, TIMING_CONFIG);
    }
    if (values.translateY) {
      values.translateY.value = withSpring(0, SPRING_CONFIG);
    }
  },
  
  exit: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(0, TIMING_CONFIG);
    }
    if (values.translateY) {
      values.translateY.value = withTiming(values.translateY.value > 0 ? 40 : -40, TIMING_CONFIG);
    }
  },
  
  createAnimatedStyle: (values) => {
    return useAnimatedStyle(() => ({
      opacity: values.opacity?.value ?? 1,
      transform: [
        { translateY: values.translateY?.value ?? 0 },
      ],
    }));
  },
};

/**
 * Slide left animation preset
 * Content slides in from the right (forward) or left (backward)
 */
const slideLeftPreset: AnimationPreset = {
  initialize: (isForward) => ({
    opacity: useSharedValue(0),
    translateX: useSharedValue(isForward ? 100 : -100),
  }),
  
  enter: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(1, TIMING_CONFIG);
    }
    if (values.translateX) {
      values.translateX.value = withSpring(0, SPRING_CONFIG);
    }
  },
  
  exit: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(0, TIMING_CONFIG);
    }
    if (values.translateX) {
      values.translateX.value = withTiming(values.translateX.value > 0 ? 100 : -100, TIMING_CONFIG);
    }
  },
  
  createAnimatedStyle: (values) => {
    return useAnimatedStyle(() => ({
      opacity: values.opacity?.value ?? 1,
      transform: [
        { translateX: values.translateX?.value ?? 0 },
      ],
    }));
  },
};

/**
 * Slide right animation preset
 * Content slides in from the left (forward) or right (backward)
 */
const slideRightPreset: AnimationPreset = {
  initialize: (isForward) => ({
    opacity: useSharedValue(0),
    translateX: useSharedValue(isForward ? -100 : 100),
  }),
  
  enter: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(1, TIMING_CONFIG);
    }
    if (values.translateX) {
      values.translateX.value = withSpring(0, SPRING_CONFIG);
    }
  },
  
  exit: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(0, TIMING_CONFIG);
    }
    if (values.translateX) {
      values.translateX.value = withTiming(values.translateX.value > 0 ? 100 : -100, TIMING_CONFIG);
    }
  },
  
  createAnimatedStyle: (values) => {
    return useAnimatedStyle(() => ({
      opacity: values.opacity?.value ?? 1,
      transform: [
        { translateX: values.translateX?.value ?? 0 },
      ],
    }));
  },
};

/**
 * Scale animation preset
 * Content scales up from smaller size
 */
const scalePreset: AnimationPreset = {
  initialize: (_isForward) => ({
    opacity: useSharedValue(0),
    scale: useSharedValue(0.8),
  }),
  
  enter: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(1, TIMING_CONFIG);
    }
    if (values.scale) {
      values.scale.value = withSpring(1, SPRING_CONFIG);
    }
  },
  
  exit: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(0, TIMING_CONFIG);
    }
    if (values.scale) {
      values.scale.value = withTiming(0.8, TIMING_CONFIG);
    }
  },
  
  createAnimatedStyle: (values) => {
    return useAnimatedStyle(() => ({
      opacity: values.opacity?.value ?? 1,
      transform: [
        { scale: values.scale?.value ?? 1 },
      ],
    }));
  },
};

/**
 * Fade and slide up animation preset
 * Content fades in while sliding up (most common onboarding animation)
 */
const fadeSlideUpPreset: AnimationPreset = {
  initialize: (isForward) => ({
    opacity: useSharedValue(0),
    translateY: useSharedValue(isForward ? 20 : -20),
  }),
  
  enter: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(1, TIMING_CONFIG);
    }
    if (values.translateY) {
      values.translateY.value = withSpring(0, SPRING_CONFIG);
    }
  },
  
  exit: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(0, TIMING_CONFIG);
    }
    if (values.translateY) {
      values.translateY.value = withTiming(values.translateY.value > 0 ? 20 : -20, TIMING_CONFIG);
    }
  },
  
  createAnimatedStyle: (values) => {
    return useAnimatedStyle(() => ({
      opacity: values.opacity?.value ?? 1,
      transform: [
        { translateY: values.translateY?.value ?? 0 },
      ],
    }));
  },
};

/**
 * Fade and scale animation preset
 * Content fades in while scaling up
 */
const fadeScalePreset: AnimationPreset = {
  initialize: (_isForward) => ({
    opacity: useSharedValue(0),
    scale: useSharedValue(0.95),
  }),
  
  enter: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(1, TIMING_CONFIG);
    }
    if (values.scale) {
      values.scale.value = withSpring(1, SPRING_CONFIG);
    }
  },
  
  exit: (values) => {
    if (values.opacity) {
      values.opacity.value = withTiming(0, TIMING_CONFIG);
    }
    if (values.scale) {
      values.scale.value = withTiming(0.95, TIMING_CONFIG);
    }
  },
  
  createAnimatedStyle: (values) => {
    return useAnimatedStyle(() => ({
      opacity: values.opacity?.value ?? 1,
      transform: [
        { scale: values.scale?.value ?? 1 },
      ],
    }));
  },
};

/**
 * Map of animation presets by type
 */
export const ANIMATION_PRESETS: Record<AnimationPresetType, AnimationPreset> = {
  [AnimationPresets.fade]: fadePreset,
  [AnimationPresets.slideUp]: slideUpPreset,
  [AnimationPresets.slideLeft]: slideLeftPreset,
  [AnimationPresets.slideRight]: slideRightPreset,
  [AnimationPresets.scale]: scalePreset,
  [AnimationPresets.fadeSlideUp]: fadeSlideUpPreset,
  [AnimationPresets.fadeScale]: fadeScalePreset,
};

/**
 * Default animation preset
 */
export const DEFAULT_ANIMATION_PRESET: AnimationPresetType = AnimationPresets.fadeSlideUp;
