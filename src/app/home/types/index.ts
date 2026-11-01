declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

export type TGameMode = "topTracks" | "playlist" | "multiplayer";

export type TAnswerMode = "search" | "multipleChoice";

export type TChoiceOption = {
  name: string;
  artist: string;
};

export type TTrackList = {
  items: SpotifyApi.TrackObjectFull[];
};

export type TPlayerState = {
  accessToken: string | null;
  trackList: TTrackList | null;
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
  sdkReady: boolean;
  currentTrack: SpotifyApi.SingleTrackResponse | null;
  isPlaying: boolean;
  isPausing: boolean;
  isClicked: boolean;
  isContinue: boolean;
  songInterval: number;
};

export type TGameState = {
  numberOfAttempt: number;
  score: number;
  highestScore: number;
  isLose: boolean;
};

export type TChooseResult = {
  isChoose: boolean;
  isCorrect: boolean;
};

export type TLoseModalProps = {
  highScore: number;
  songName: string;
  artistName: string;
  image: string;
  chooseResult: TChooseResult;
  score: number;
  handlePlayAgain: () => void;
  handleChangeMode: () => void;
};
