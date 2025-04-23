import type { ComponentType } from "react";
import type { QuestionComponentProps } from "./question";

// Use React Native's global scope for persistent component registration
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const globalScope = global as any;
if (!globalScope.__QuestionRegistry) {
	globalScope.__QuestionRegistry = {};
}

const components = globalScope.__QuestionRegistry;

/**
 * Registry interface for managing question components in the form system.
 * This provides type-safe registration and retrieval of components globally.
 *
 * @example
 * Creating and registering a custom select component:
 * ```typescript
 * function SelectQuestion({ question, value, onChange }: QuestionComponentProps) {
 *   return (
 *     <View>
 *       <Text>{question.question}</Text>
 *       {question.options.map(option => (
 *         <TouchableOpacity
 *           key={option.value}
 *           onPress={() => onChange(question.name, option.value)}
 *         >
 *           <Text>{option.label}</Text>
 *         </TouchableOpacity>
 *       ))}
 *     </View>
 *   );
 * }
 *
 * // Register once, use anywhere
 * Registry.register('select', SelectQuestion);
 * ```
 *
 * Then use in your config:
 * ```typescript
 * const config = {
 *   questions: [{
 *     type: 'select',  // Automatically works!
 *     name: 'choice',
 *     question: 'Pick one',
 *     options: [
 *       { label: 'Option 1', value: '1' },
 *       { label: 'Option 2', value: '2' }
 *     ]
 *   }]
 * }
 * ```
 */
export interface ComponentRegistry {
	/**
	 * Register a new question component globally. Once registered, the component
	 * can be used in any questionnaire config by referencing its type.
	 *
	 * @param type - Unique identifier for the question type (e.g., 'select', 'chips')
	 * @param component - React component that implements QuestionComponentProps
	 */
	register: (
		type: string,
		component: ComponentType<QuestionComponentProps>,
	) => void;

	/**
	 * Retrieve a registered component by its type
	 * @param type - The question type to retrieve
	 * @returns The registered React component for the question type
	 * @throws Error if the requested question type is not registered
	 */
	get: (type: string) => ComponentType<QuestionComponentProps>;

	/**
	 * Get all registered components
	 * @returns Object mapping question types to their components
	 */
	getAll: () => Record<string, ComponentType<QuestionComponentProps>>;
}

/**
 * Global registry for managing form question components.
 * Components registered here are available throughout the application
 * without requiring additional imports or setup.
 */
export const Registry: ComponentRegistry = {
	register: (
		type: string,
		component: ComponentType<QuestionComponentProps>,
	) => {
		components[type] = component;
	},

	get: (type: string) => {
		const component = components[type];
		if (!component) {
			throw new Error(`Question type ${type} is not supported`);
		}
		return component;
	},

	getAll: () => components,
};

/**
 * Export the components registry for debugging purposes
 */
export const questionComponents = components;
