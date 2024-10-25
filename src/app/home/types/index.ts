declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

export type TPlayerState = {
  accessToken: string | null;
  trackList: SpotifyApi.UsersTopTracksResponse | null;
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
};
