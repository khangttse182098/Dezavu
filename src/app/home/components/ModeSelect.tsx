import React from "react";
import { TGameMode } from "../types";
import CardSelect, { TCardOption } from "./CardSelect";

const modeOptions: TCardOption[] = [
  {
    value: "topTracks",
    index: "01",
    title: "MOST PLAYED",
    description: "Your all-time favorites. The songs you swear you know.",
  },
  {
    value: "playlist",
    index: "02",
    title: "MY PLAYLISTS",
    description: "Pick one of your own playlists and get quizzed on it.",
  },
  {
    value: "multiplayer",
    index: "03",
    title: "PARTY MODE",
    description: "Live rooms. Same song, everyone guesses at once.",
  },
];

const ModeSelect = ({
  handleSelectMode,
}: {
  handleSelectMode: (mode: TGameMode) => void;
}) => {
  return (
    <CardSelect
      heading="PICK A MODE"
      subheading="What should we quiz you on?"
      options={modeOptions}
      handleSelect={(value) => handleSelectMode(value as TGameMode)}
    />
  );
};

export default ModeSelect;
