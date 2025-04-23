import { default as Questionnaire } from "./Questionaire";
import { ContinueButton } from "./components";
import ProgressBar from "./components/ProgressBar";
import useQuestionnaire from "./hooks/useQuestionnaire";
import { Registry } from "./types/QuestionComponents";
import { Input } from "../defaults";

Registry.register("input", Input);

export {
	Questionnaire,
	Registry,
	ContinueButton,
	ProgressBar,
	useQuestionnaire,
};

export * from "./types/question";
export * from "./types/QuestionComponents";
