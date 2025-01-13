import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";

import { Registry } from "../core/types/QuestionComponents";
import {
  QuestionComponentProps,
  BaseQuestion,
  QuestionTypes,
} from "../core/types/question";

// Declare input question type
declare module "../core/types/Question" {
  interface QuestionTypes {
    input: Partial<TextInputProps> & {
      placeholder?: string;
    };
  }
}

// Input-specific props
interface InputProps extends Omit<QuestionComponentProps, "question"> {
  question: InputQuestion;
  debounceTime?: number;
  inputProps?: Partial<TextInputProps>;
  error?: string;
}

// Create input-specific question type
type InputQuestion = BaseQuestion & { type: "input" } & QuestionTypes["input"];

function InputQuestion({ question, value = "", onChange, error }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (text: string) => {
      onChange(question.name, text);
    },
    [onChange, question.name]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const containerStyle = [
    styles.inputContainer,
    error ? styles.errorContainer : null,
    isFocused ? styles.focusedContainer : null,
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.questionText} accessibilityRole="header">
        {question.question}
      </Text>

      <View style={containerStyle}>
        <TextInput
          style={styles.input}
          placeholder={question.placeholder}
          placeholderTextColor={
            error ? styles.errorPlaceholder.color : styles.placeholder.color
          }
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={question.question}
          accessibilityHint={question.placeholder}
          autoCorrect={false}
          {...question}
        />
      </View>

      {error && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}

      {question.subheading && !error && (
        <Text style={styles.helperText}>{question.subheading}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  questionText: {
    marginBottom: 8,
    fontSize: 18,
    color: "#44403c",
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 16,
    borderColor: "transparent",
    backgroundColor: "#f5f5f4",
  },
  focusedContainer: {
    borderColor: "#797269",
  },
  errorContainer: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  input: {
    padding: 16,
  },
  placeholder: {
    color: "#797269",
  },
  errorPlaceholder: {
    color: "#dc2626",
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: "#ef4444",
  },
  helperText: {
    marginTop: 4,
    fontSize: 14,
    color: "#78716c",
  },
});

// Register the component
Registry.register(
  "input",
  InputQuestion as React.ComponentType<QuestionComponentProps>
);

export default InputQuestion;
