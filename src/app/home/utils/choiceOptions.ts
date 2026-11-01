import { randomize } from "@/utils/randomize";
import { TChoiceOption, TTrackList } from "../types";

const shuffle = <T,>(list: T[]): T[] => {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomize(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

//build the multiple choice options: the correct track + up to 3 decoys from the pool
export const generateChoiceOptions = (
  correctTrack: SpotifyApi.SingleTrackResponse,
  trackList: TTrackList | null
): TChoiceOption[] => {
  const correct: TChoiceOption = {
    name: correctTrack.name,
    artist: correctTrack.artists[0].name,
  };

  //dedupe the pool by song + artist and drop the correct answer
  const decoyMap = new Map<string, TChoiceOption>();
  trackList?.items.forEach((track) => {
    const option = { name: track.name, artist: track.artists[0].name };
    const key = `${option.name} - ${option.artist}`;
    if (option.name !== correct.name || option.artist !== correct.artist) {
      decoyMap.set(key, option);
    }
  });

  const decoys = shuffle(Array.from(decoyMap.values())).slice(0, 3);

  return shuffle([correct, ...decoys]);
};
