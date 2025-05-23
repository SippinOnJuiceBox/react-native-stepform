# React Native StepForm

A lightweight, customizable multi-step form library for React Native with built-in validation, smooth animations, and a modular component registry system.

![npm](https://img.shields.io/npm/v/react-native-stepform)
![license](https://img.shields.io/npm/l/react-native-stepform)

## Features

- **Unified Hook API** - Single hook for all form management needs
- **Smooth Animations** - Built-in animation presets using React Native Reanimated
- **Type Safety** - Full TypeScript support with proper type definitions
- **Performance Optimized** - Efficient rendering and state management
- **Modular Component System** - Easily extend with custom question types
- **Built-in Validation** - Integrated Zod validation with error handling
- **Async Operations** - Support for API calls during form progression
- **Highly Customizable** - Style and render props for complete UI control
- **Skippable Questions** - Support for optional questions that can be skipped
- **Separate Enter/Exit Animations** - Customizable animations for entering and exiting questions

## Installation

```bash
# Using npm
npm install react-native-stepform zod react-native-reanimated

# Using yarn
yarn add react-native-stepform zod react-native-reanimated
```

> **Note:** Make sure to follow the [React Native Reanimated installation instructions](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation) to complete the setup.

## Basic Usage

```tsx
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Questionnaire } from "react-native-stepform";
import { z } from "zod";

export default function App() {
  // Define your form steps and questions
  const config = [
    {
      questions: [
        {
          type: "input",
          name: "name",
          question: "What's your name?",
          placeholder: "Enter your full name",
          validation: z.string().min(2, "Name must be at least 2 characters"),
        },
      ],
    },
    {
      questions: [
        {
          type: "input",
          name: "email",
          question: "What's your email address?",
          placeholder: "Enter your email",
          validation: z.string().email("Please enter a valid email"),
          autoComplete: "email",
          skippable: true, // This question can be skipped
        },
      ],
    },
  ];

  // Handle form submission
  const handleComplete = async (formData) => {
    console.log("Form submitted:", formData);
    // Submit to your API or perform other actions
  };

  return (
    <SafeAreaProvider>
      <Questionnaire
        config={config}
        onCompleted={handleComplete}
        animationPreset="fadeSlideUp" // Default animation for both enter and exit
        // Or specify different animations for enter and exit
        enterPreset="fadeSlideUp"
        exitPreset="fadeSlideDown"
      />
    </SafeAreaProvider>
  );
}
```

## Advanced Usage with the Hook API

For more control over the form, you can use the `useQuestionnaire` hook directly:

```tsx
import React from "react";
import { View, Text } from "react-native";
import { useQuestionnaire, ProgressBar, ContinueButton } from "react-native-stepform";
import { z } from "zod";

export default function CustomForm() {
  const config = [
    // Your form configuration
  ];

  const {
    currentStep,
    currentStepData,
    formData,
    handleNext,
    handleBack,
    handleSkip,
    handleInputChange,
    isStepValid,
    isSubmittingStep,
    isProcessingField,
    errors,
    totalSteps,
    hasSkippableQuestions,
    fadeAnim,
    animationPreset,
  } = useQuestionnaire({
    config,
    initialStep: 0,
    initialValues: { name: "John Doe" },
    onCompleted: async (data) => {
      console.log("Form completed:", data);
    },
    onStepChange: (step) => {
      console.log(`Moved to step ${step}`);
    },
    debug: true, // Enable debug logging
    animationPreset: "fadeSlideUp",
    enterPreset: "fadeSlideUp",
    exitPreset: "fadeSlideDown",
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Custom header */}
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {currentStepData.pageHeader}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        {currentStepData.pageSubheader}
      </Text>
      
      {/* Progress indicator */}
      <ProgressBar 
        current={currentStep} 
        total={totalSteps} 
        height={8}
        backgroundColor="#f5f5f4"
        progressColor="#44403c"
        animationDuration={300}
      />
      
      {/* Render your custom form fields here */}
      {currentStepData.questions.map((question) => (
        <View key={question.name}>
          {/* Your custom input component */}
          <YourInputComponent
            question={question}
            value={formData[question.name]}
            onChange={(value) => handleInputChange(question.name, value)}
            error={errors[question.name]}
          />
        </View>
      ))}
      
      {/* Navigation buttons */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        {currentStep > 0 && (
          <ContinueButton
            onPress={handleBack}
            style={{ marginRight: 8 }}
          >
            <Text>Back</Text>
          </ContinueButton>
        )}
        
        <ContinueButton
          onPress={handleNext}
          disabled={!isStepValid || isSubmittingStep}
        >
          <Text>
            {isSubmittingStep ? "Processing..." : "Continue"}
          </Text>
        </ContinueButton>
        
        {hasSkippableQuestions && (
          <ContinueButton
            onPress={handleSkip}
            style={{ marginLeft: 8 }}
          >
            <Text>Skip</Text>
          </ContinueButton>
        )}
      </View>
    </View>
  );
}
```

## Animation System

The library includes a powerful animation system built on React Native Reanimated, with several built-in presets:

```tsx
<Questionnaire
  config={config}
  onCompleted={handleComplete}
  animationPreset="fadeSlideUp" // Default animation for both enter and exit
  // Or specify different animations for enter and exit
  enterPreset="fadeSlideUp"
  exitPreset="fadeSlideDown"
/>
```

Available animation presets:
- `fade` - Simple fade in/out
- `slideUp` - Slide up from bottom
- `slideLeft` - Slide in from right (forward) or left (backward)
- `slideRight` - Slide in from left (forward) or right (backward)
- `scale` - Scale up from smaller size
- `fadeSlideUp` - Fade in while sliding up (default)
- `fadeScale` - Fade in while scaling up

## API Reference

### Questionnaire Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `QuestionConfig` | Configuration object defining all steps and questions |
| `onCompleted` | `(formData: Record<string, unknown>) => Promise<void>` | Callback fired when questionnaire is completed |
| `onStepChange?` | `(currentStep: number) => void` | Optional callback fired when step changes |
| `initialStep?` | `number` | Starting step index (defaults to 0) |
| `initialValues?` | `Record<string, unknown>` | Initial form values |
| `onBeforeNext?` | `(currentStep: number, formData: Record<string, unknown>) => Promise<boolean>` | Async validation before proceeding |
| `onBeforeBack?` | `(currentStep: number) => Promise<boolean>` | Async validation before going back |
| `onExit?` | `() => void` | Callback fired when user attempts to exit |
| `debug?` | `boolean` | Enable debug logging |
| `animationPreset?` | `AnimationPresetType` | Animation preset to use for transitions |
| `enterPreset?` | `AnimationPresetType` | Animation preset for entering questions |
| `exitPreset?` | `AnimationPresetType` | Animation preset for exiting questions |
| `renderHeader?` | `(props: HeaderProps) => React.ReactNode` | Custom header renderer |
| `renderFooter?` | `(props: FooterProps) => React.ReactNode` | Custom footer renderer |
| `renderQuestion?` | `(question: QuestionQuestion, defaultRender: Function) => React.ReactNode` | Custom question renderer |

### useQuestionnaire Hook

The unified hook that manages the complete questionnaire experience:

```tsx
const {
  // Current state
  currentStep,         // Current step index
  currentStepData,     // Data for the current step
  formData,            // Current form data
  isStepValid,         // Whether current step passes validation
  isForward,           // Whether navigation direction is forward
  isSubmittingStep,    // Whether step is submitting
  isProcessingField,   // Whether a field is processing (e.g. uploading)
  errors,              // Validation errors
  totalSteps,          // Total number of steps
  hasSkippableQuestions, // Whether current step has skippable questions
  
  // Animation
  fadeAnim,            // Animation value
  animationPreset,     // Current animation preset
  
  // Actions
  handleNext,          // Go to next step
  handleBack,          // Go to previous step
  handleSkip,          // Skip the current question
  handleInputChange,   // Update form values
  validateStep,        // Validate current step
  setFieldDirty,       // Mark field as dirty for validation
  
  // Navigation
  goToStep,            // Go to specific step
} = useQuestionnaire({
  // Options
  config,
  initialStep,
  initialValues,
  onCompleted,
  onStepChange,
  debug,
  animationPreset,
  enterPreset,
  exitPreset,
});
```

#### Hook Options

| Option | Type | Description |
|--------|------|-------------|
| `config` | `QuestionConfig` | Configuration object defining all steps and questions |
| `initialStep?` | `number` | Starting step index (defaults to 0) |
| `initialValues?` | `Record<string, unknown>` | Initial form values |
| `onCompleted?` | `(formData: Record<string, unknown>) => Promise<void>` | Callback fired when questionnaire is completed |
| `onStepChange?` | `(currentStep: number) => void` | Optional callback fired when step changes |
| `onBeforeNext?` | `(currentStep: number, formData: Record<string, unknown>) => Promise<boolean>` | Async validation before proceeding |
| `onBeforeBack?` | `(currentStep: number) => Promise<boolean>` | Async validation before going back |
| `onExit?` | `() => void` | Callback fired when user attempts to exit |
| `debug?` | `boolean` | Enable debug logging |
| `animationPreset?` | `AnimationPresetType` | Animation preset to use for transitions |
| `enterPreset?` | `AnimationPresetType` | Animation preset for entering questions |
| `exitPreset?` | `AnimationPresetType` | Animation preset for exiting questions |

### Components

#### ProgressBar

Animated progress indicator for multi-step forms:

```tsx
import { ProgressBar } from "react-native-stepform";

<ProgressBar 
  current={currentStep} 
  total={totalSteps}
  height={8}                   // Optional: Height in pixels
  backgroundColor="#f5f5f4"    // Optional: Background color
  progressColor="#44403c"      // Optional: Progress indicator color
  animationDuration={300}      // Optional: Animation duration in ms
/>
```

#### ContinueButton

Customizable button for form navigation:

```tsx
import { ContinueButton } from "react-native-stepform";

<ContinueButton
  onPress={handleNext}
  disabled={!isStepValid}
  style={{ /* your custom styles */ }}
>
  {/* Optional custom content */}
  <Text>Continue</Text>
</ContinueButton>
```

## Creating Custom Question Types

You can extend the library with custom question types by registering them with the component registry:

```tsx
import { Registry } from "react-native-stepform";
import { View, Text, TouchableOpacity } from "react-native";

// Define your custom component
function SelectQuestion({ question, value, onChange }) {
  return (
    <View>
      <Text>{question.question}</Text>
      {question.options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={{
            padding: 12,
            backgroundColor: value === option.value ? "#e0e0e0" : "#f5f5f5",
            marginVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Register your component
Registry.register("select", SelectQuestion);

// Update your question types (in a separate types file)
declare module "react-native-stepform" {
  interface QuestionTypes {
    select: {
      options: Array<{ label: string; value: string }>;
    };
  }
}

// Now you can use it in your config
const config = [
  {
    pageHeader: "Preferences",
    pageSubheader: "Tell us what you like",
    questions: [
      {
        type: "select", // Your custom type
        name: "favoriteColor",
        question: "What's your favorite color?",
        options: [
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
          { label: "Green", value: "green" },
        ],
        validation: z.string(),
      },
    ],
  },
];
```

## Custom Rendering

The library provides several render props for complete UI customization:

### Custom Header

```tsx
<Questionnaire
  config={config}
  renderHeader={({ 
    currentStep, 
    totalSteps, 
    handleBack,
    handleNext,
    handleSkip,
    isValid,
    isSubmittingStep,
    isProcessingField,
    hasSkippableQuestions,
    currentStepData,
    formData,
    errors,
    handleInputChange
  }) => (
    <View style={{ padding: 16, backgroundColor: "#f0f0f0" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Step {currentStep + 1} of {totalSteps}
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        {currentStep > 0 && (
          <TouchableOpacity onPress={handleBack}>
            <Text>Back</Text>
          </TouchableOpacity>
        )}
        
        {hasSkippableQuestions && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={{ color: '#666' }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )}
/>
```

### Custom Footer

```tsx
<Questionnaire
  config={config}
  renderFooter={({ 
    handleNext, 
    handleBack,
    isValid, 
    isSubmittingStep,
    isProcessingField,
    currentStep, 
    totalSteps,
    currentStepData,
    formData,
    errors,
    handleInputChange
  }) => (
    <View style={{ padding: 16 }}>
      <TouchableOpacity
        onPress={handleNext}
        disabled={!isValid || isSubmittingStep}
        style={{ 
          padding: 12, 
          backgroundColor: isValid ? "#007bff" : "#cccccc",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {isSubmittingStep ? "Processing..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  )}
/>
```

### Custom Question Renderer

```tsx
<Questionnaire
  config={config}
  renderQuestion={(question, defaultRender) => (
    <View style={{ padding: 16, backgroundColor: "#f9f9f9", marginBottom: 8 }}>
      {defaultRender(question)}
      {question.question && (
        <Text style={{ marginTop: 4, color: "#666" }}>
          {question.question}
        </Text>
      )}
    </View>
  )}
/>
```

## License

MIT
