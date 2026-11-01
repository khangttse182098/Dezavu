import React from "react";
import { TAnswerMode } from "../types";
import CardSelect, { TCardOption } from "./CardSelect";

const answerOptions: TCardOption[] = [
  {
    value: "search",
    index: "01",
    title: "SEARCH IT",
    description: "Hardcore. Type your guess from pure memory.",
  },
  {
    value: "multipleChoice",
    index: "02",
    title: "MULTIPLE CHOICE",
    description: "Four songs on the table. Only one is playing.",
  },
];

const AnswerSelect = ({
  handleSelectAnswerMode,
  handleBack,
}: {
  handleSelectAnswerMode: (answerMode: TAnswerMode) => void;
  handleBack: () => void;
}) => {
  return (
    <CardSelect
      heading="PICK YOUR STYLE"
      subheading="How will you answer?"
      options={answerOptions}
      handleSelect={(value) => handleSelectAnswerMode(value as TAnswerMode)}
      handleBack={handleBack}
    />
  );
};

export default AnswerSelect;
