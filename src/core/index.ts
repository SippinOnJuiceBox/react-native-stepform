import { default as Questionnaire } from "./Questionaire";
import { ContinueButton, ProgressBar } from "./components";
import { useQuestionnaireAnimation } from "./hooks/useQuestionaireAnimation";
import { useQuestionnaireValidation } from "./hooks/useQuestionaireValidation";
import { useQuestionnaireNavigation } from "./hooks/useQuestionaireNavigation";
import { Registry } from "./types/QuestionComponents";
import { Input } from "../defaults";

// Register default input component
Registry.register("input", Input);

export {
  Questionnaire,
  Registry,
  ContinueButton,
  ProgressBar,
  useQuestionnaireAnimation,
  useQuestionnaireValidation,
  useQuestionnaireNavigation,
};

export * from "./types/question";
export * from "./types/QuestionComponents";
