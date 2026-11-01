//shared between the Next.js client and the PartyKit room server (party/index.ts)
//keep this file free of react/next/spotify-sdk imports so the party server can bundle it

export const TOTAL_ROUNDS = 10;
export const GUESS_WINDOW_MS = 20_000;
export const SNIPPET_MS = 10_000;
export const REVEAL_MS = 8_000;
export const MIN_TRACKS = 4;
export const BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 50;

//a track slimmed down to what the room server needs
export type TSimpleTrack = {
  uri: string;
  name: string;
  artist: string;
  durationMs: number;
  image: string | null;
};

export type TRoomPhase = "lobby" | "playing" | "reveal" | "gameover";

export type TChoice = {
  name: string;
  artist: string;
};

export type TPublicPlayer = {
  id: string;
  name: string;
  image: string | null;
  score: number;
  ready: boolean;
  connected: boolean;
  hasAnswered: boolean;
};

//round info that is safe to send while players are still guessing
//(no correctIndex here — the answer only ships with TRoundResult)
export type TPublicRound = {
  number: number;
  trackUri: string;
  positionMs: number;
  snippetMs: number;
  options: TChoice[];
  deadline: number;
};

export type TRoundResult = {
  roundNumber: number;
  correctIndex: number;
  track: { name: string; artist: string; image: string | null };
  answers: Record<
    string,
    { choiceIndex: number | null; correct: boolean; gained: number }
  >;
};

export type TRoomState = {
  phase: TRoomPhase;
  hostId: string | null;
  players: TPublicPlayer[];
  playlistName: string | null;
  trackCount: number;
  totalRounds: number;
  round: TPublicRound | null;
  lastResult: TRoundResult | null;
};

export type TClientMessage =
  | { type: "join"; playerId: string; name: string; image: string | null }
  | { type: "set_playlist"; playlistName: string; tracks: TSimpleTrack[] }
  | { type: "ready"; ready: boolean }
  | { type: "start" }
  | { type: "answer"; choiceIndex: number }
  | { type: "play_again" };

export type TServerMessage =
  | { type: "state"; state: TRoomState }
  | { type: "error"; message: string };

//no ambiguous characters (0/O, 1/I/L) so codes are easy to read out loud
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 4;

export const generateRoomCode = () => {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
};

export const isValidRoomCode = (code: string) =>
  code.length === ROOM_CODE_LENGTH &&
  code.split("").every((char) => CODE_ALPHABET.includes(char));
