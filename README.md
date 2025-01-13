# React Native StepForm

This is a lightweight customizable multi-step form library for React Native with built-in validation using Zod and a modular component registry system.

## Demo

Check out the demo [here](https://youtu.be/X5Uo1xKKras) and play around with some sample marquees.

## Installation

Install react-native-stepform with `npm`

```bash
npm install react-native-stepform react-native-reanimated
```

If you're using `yarn`, run:

```bash
yarn add react-native-stepform react-native-reanimated
```

## Usage/Examples

```typescript
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Questionnaire } from "react-native-stepform";
import { z } from "zod";

// Create a config
const config = [
  {
    pageHeader: "Login",
    pageSubheader: "Enter your email to get started",
    questions: [
      {
        type: "input",
        name: "email",
        question: "What is your email?",
        placeholder: "Enter your email",
        validation: z.string().email("Please enter a valid email"),
      },
    ],
  },
  {
    pageHeader: "Set Password",
    pageSubheader: "Choose a secure password",
    questions: [
      {
        type: "input",
        name: "password",
        question: "Create a password",
        placeholder: "Enter your password",
        secureTextEntry: true,
        validation: z.string().min(8, "Password must be at least 8 characters"),
      },
    ],
  },
];

export default function App() {
  const handleComplete = async (formData) => {
    console.log("Form submitted:", formData);
  };

  return (
    <SafeAreaProvider>
      <Questionnaire
        //  Use the config
        config={config}
        onCompleted={handleComplete}
      />
    </SafeAreaProvider>
  );
}
```

## API Reference

### Questionnaire Props

| Prop                        | Type                                                                       | Description                                           |
| --------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| `config`                    | `QuestionConfig`                                                           | Configuration object defining all steps and questions |
| `onCompleted`               | `(formData: Record<string, any>) => Promise<void>`                         | Callback fired when questionnaire is completed        |
| `onStepChange?`             | `(currentStep: number) => void`                                            | Optional callback fired when step changes             |
| `initialStep?`              | `number`                                                                   | Starting step index (defaults to 0)                   |
| `customQuestionComponents?` | `Record<string, React.ComponentType>`                                      | Map of custom components                              |
| `hideHeader?`               | `boolean`                                                                  | Whether to hide the default header                    |
| `initialValues?`            | `Record<string, any>`                                                      | Initial form values                                   |
| `onBeforeNext?`             | `(step: number, data: Record<string, any>) => Promise<boolean>`            | Validation before proceeding                          |
| `onBeforeBack?`             | `(step: number) => Promise<boolean>`                                       | Validation before going back                          |
| `renderHeader?`             | `(props: HeaderProps) => React.ReactNode`                                  | Custom header renderer                                |
| `renderQuestion?`           | `(question: QuestionQuestion, defaultRender: Function) => React.ReactNode` | Custom question renderer                              |
| `renderFooter?`             | `(props: FooterProps) => React.ReactNode`                                  | Custom footer renderer                                |

### Built-in Components

#### Input

Basic text input component with validation support.

```typescript
{
  type: 'input',
  name: 'fieldName',
  question: 'Label text',
  placeholder: 'Placeholder text',
  validation: z.string()
}
```

#### Progress Bar

Shows step completion progress.

```typescript
import { ProgressBar } from "react-native-stepform";

<ProgressBar current={currentStep} total={totalSteps} />;
```

#### ProgressBar Props

| Prop      | Type     | Description                     |
| --------- | -------- | ------------------------------- |
| `current` | `number` | Current step index (zero-based) |
| `total`   | `number` | Total number of steps           |

#### Continue Button

Customizable button for form navigation.

```typescript
import { ProgressBar } from "react-native-stepform";

<ProgressBar current={currentStep} total={totalSteps} />;
```

#### Continue Button Props

| Prop       | Type              | Description                                                                                    |
| ---------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `onPress`  | `() => void`      | Function called when button is pressed                                                         |
| `disabled` | `boolean`         | Optional. When true, button is grayed out and not clickable                                    |
| `children` | `React.ReactNode` | Optional. Custom content to render inside button. If not provided, defaults to "Continue" text |
| `style`    | `ViewStyle`       | Optional. Custom styles to apply to button container                                           |

### Hooks

#### useQuestionnaireValidation

| Parameter     | Type                  | Description                       |
| ------------- | --------------------- | --------------------------------- |
| `currentStep` | `QuestionStep`        | Current step configuration object |
| `formData`    | `Record<string, any>` | Current form data                 |

Returns:
| Value | Type | Description |
|------|------|-------------|
| `isStepValid` | `boolean` | Whether current step passes validation |
| `validateStep` | `() => boolean` | Manually trigger validation |
| `errors` | `Record<string, string>` | Field-level error messages |
| `setFieldDirty` | `(fieldName: string) => void` | Mark field as touched |

#### useQuestionnaireAnimation

Returns:
| Value | Type | Description |
|------|------|-------------|
| `fadeAnim` | `Animated.Value` | Current opacity value |
| `fadeOut` | `() => void` | Trigger fade out animation |
| `fadeIn` | `() => void` | Trigger fade in animation |

#### useQuestionnaireNavigation

| Parameter        | Type                     | Description                 |
| ---------------- | ------------------------ | --------------------------- |
| `currentStep`    | `number`                 | Current step index          |
| `fadeOut`        | `() => void`             | Fade out animation function |
| `fadeIn`         | `() => void`             | Fade in animation function  |
| `setCurrentStep` | `(step: number) => void` | Step setter function        |
| `onExit?`        | `() => void`             | Optional exit callback      |

Returns:
| Value | Type | Description |
|------|------|-------------|
| `handleBack` | `() => void` | Handle back navigation with animations |

### Custom Components

#### Creating Custom Questions

Here is an example on how to create custom questions, In this example I'll show a multiple choice question where you can only select one option.

| Prop       | Type                                 | Description                   |
| ---------- | ------------------------------------ | ----------------------------- |
| `question` | `QuestionQuestion`                   | Question configuration object |
| `value`    | `any`                                | Current value of the field    |
| `onChange` | `(name: string, value: any) => void` | Value change handler          |
| `error`    | `string \| undefined`                | Current error message if any  |

Note: Any additional props can be added in the type declaration (example below)

I am also not using styles in this example, you should add them yourself

```typescript
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Registry } from "react-native-stepform";
import type {
  QuestionComponentProps,
  BaseQuestion,
  QuestionTypes,
} from "react-native-stepform";

// Declare your question type
declare module "react-native-stepform" {
  interface QuestionTypes {
    select: {
      options: { label: string; value: string }[];
    };
  }
}

// Create select-specific props
type SelectQuestion = BaseQuestion & {
  type: "select";
} & QuestionTypes["select"];

interface SelectProps extends Omit<QuestionComponentProps, "question"> {
  question: SelectQuestion;
}

function SelectQuestion({ question, value, onChange }: SelectProps) {
  return (
    <View>
      <Text>{question.question}</Text>
      {question.options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(question.name, option.value)}
        >
          <Text>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Register the component
Registry.register(
  "select",
  SelectQuestion as React.ComponentType<QuestionComponentProps>
);

export default SelectQuestion;
```

Then you can easily use it in yout questionaire config

```typescript
const config = [
  {
    pageHeader: "Select an Option",
    questions: [
      {
        type: "select",
        name: "choice",
        question: "Choose one:",
        options: [
          { label: "Option 1", value: "1" },
          { label: "Option 2", value: "2" },
        ],
      },
    ],
  },
];
```

### Rendering Custom Questions

#### renderHeader

| Prop           | Type                                      | Description            |
| -------------- | ----------------------------------------- | ---------------------- |
| `renderHeader` | `(props: HeaderProps) => React.ReactNode` | Custom header renderer |

HeaderProps:
| Prop | Type | Description |
|------|------|-------------|
| `currentStep` | `number` | Current step index (zero-based) |
| `totalSteps` | `number` | Total number of steps |
| `onBack` | `() => void` | Back navigation handler |

#### renderFooter

| Prop           | Type                                      | Description            |
| -------------- | ----------------------------------------- | ---------------------- |
| `renderFooter` | `(props: FooterProps) => React.ReactNode` | Custom footer renderer |

FooterProps:
| Prop | Type | Description |
|------|------|-------------|
| `onNext` | `() => void` | Handler for next/continue button |
| `isValid` | `boolean` | Whether current step is valid |
| `isProcessing` | `boolean` | Whether form is submitting |
| `isUploading` | `boolean` | Whether files are uploading |
| `currentStep` | `number` | Current step index |
| `totalSteps` | `number` | Total number of steps |
| `onBack` | `() => void` | Handler for back button |

#### renderQuestion

| Prop             | Type                                                                                                              | Description              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `renderQuestion` | `(question: QuestionQuestion, defaultRender: (question: QuestionQuestion) => React.ReactNode) => React.ReactNode` | Custom question renderer |

### Examples

#### Custom Header & Footer example

Note: I use nativewind in this example but it is agnostic of your styling framework so you can use StyleSheet.

```typescript
export default function App() {
  // using the custom select component we made above
  const config: QuestionConfig = [
    {
      pageHeader: "Contact Info",
      pageSubheader: "How can we reach you?",
      questions: [
        {
          name: "favoriteColor",
          question: "What is your favorite color?",
          type: "select",
          options: [
            { label: "Red", value: "red" },
            { label: "Blue", value: "blue" },
            { label: "Green", value: "green" },
          ],
          validation: z.string(),
        },
      ],
    },
    {
      pageHeader: "Let's get started",
      pageSubheader: "Tell us about yourself",
      questions: [
        {
          name: "firstName",
          question: "What's your first name?",
          placeholder: "Enter your first name",
          type: "input",
          validation: z.string().min(2, "Name must be at least 2 characters"),
          autoComplete: "email",
        },
      ],
    },
  ];

  const handleComplete = async (formData: Record<string, any>) => {
    return;
  };

  return (
    <Questionnaire
      config={config}
      onCompleted={handleComplete}
      renderHeader={({ currentStep, totalSteps }) => (
        <View className="bg-blue-800 p-2">
          <Text className="text-center text-lg text-white">
            Step {currentStep + 1} of {totalSteps}
          </Text>
        </View>
      )}
      //    Custom question renderer
      renderQuestion={(question, defaultRender) => (
        <View className="my-2 rounded-lg bg-gray-50 p-4">
          {defaultRender(question)}
          {question.question && (
            <Text className="mt-2 text-sm text-gray-500">
              {question.question}
            </Text>
          )}
        </View>
      )}
      //    Custom footer renderer
      renderFooter={({ onNext, onBack, isValid, isProcessing }) => (
        <View className="flex-row justify-between gap-4 p-4">
          <TouchableOpacity
            onPress={onBack}
            className="flex-1 rounded-full bg-gray-200 p-4"
          >
            <Text className="text-center text-gray-800">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            disabled={!isValid || isProcessing}
            className={`flex-1 rounded-full bg-blue-500 p-4 ${
              !isValid || isProcessing ? "opacity-50" : ""
            }`}
          >
            <Text className="text-center text-white">
              {isProcessing ? "Processing..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}
```
