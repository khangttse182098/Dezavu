import type * as Party from "partykit/server";
import {
  BASE_POINTS,
  GUESS_WINDOW_MS,
  MAX_SPEED_BONUS,
  MIN_TRACKS,
  REVEAL_MS,
  SNIPPET_MS,
  TOTAL_ROUNDS,
  TChoice,
  TClientMessage,
  TPublicPlayer,
  TRoomPhase,
  TRoomState,
  TRoundResult,
  TServerMessage,
  TSimpleTrack,
} from "../src/shared/multiplayer";

type TInternalPlayer = {
  id: string;
  name: string;
  image: string | null;
  score: number;
  ready: boolean;
  connected: boolean;
  answer: number | null;
  answeredAt: number | null;
};

type TInternalRound = {
  number: number;
  track: TSimpleTrack;
  options: TChoice[];
  correctIndex: number;
  positionMs: number;
  deadline: number;
};

type TConnectionState = { playerId: string } | null;

const shuffle = <T,>(list: T[]): T[] => {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default class DezavuRoom implements Party.Server {
  phase: TRoomPhase = "lobby";
  players = new Map<string, TInternalPlayer>();
  hostId: string | null = null;
  tracks: TSimpleTrack[] = [];
  playlistName: string | null = null;
  usedTrackIndexes = new Set<number>();
  round: TInternalRound | null = null;
  lastResult: TRoundResult | null = null;
  timer: ReturnType<typeof setTimeout> | null = null;

  constructor(readonly room: Party.Room) {}

  onMessage(raw: string, conn: Party.Connection<TConnectionState>) {
    let message: TClientMessage;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    if (message.type === "join") {
      this.handleJoin(message, conn);
      return;
    }

    //every other message requires a joined player
    const player = this.getPlayer(conn);
    if (!player) {
      this.sendError(conn, "Join the room first");
      return;
    }

    switch (message.type) {
      case "set_playlist":
        this.handleSetPlaylist(message, player, conn);
        break;
      case "ready":
        if (this.phase === "lobby") {
          player.ready = message.ready;
          this.broadcastState();
        }
        break;
      case "start":
        this.handleStart(player, conn);
        break;
      case "answer":
        this.handleAnswer(message.choiceIndex, player);
        break;
      case "play_again":
        if (player.id === this.hostId && this.phase === "gameover") {
          this.resetToLobby();
        }
        break;
    }
  }

  onClose(conn: Party.Connection<TConnectionState>) {
    const player = this.getPlayer(conn);
    if (!player) return;

    player.connected = false;

    //in the lobby a leaver is just gone; mid-game we keep them so they can rejoin with their score
    if (this.phase === "lobby") {
      this.players.delete(player.id);
    }

    //if everyone left, wind the room back so the next visitor gets a fresh lobby
    if (this.connectedPlayers().length === 0) {
      this.clearTimer();
      this.players.clear();
      this.phase = "lobby";
      this.round = null;
      this.lastResult = null;
      this.hostId = null;
      this.usedTrackIndexes.clear();
      return;
    }

    this.migrateHostIfNeeded();

    //don't leave a round hanging on a player who walked away
    if (this.phase === "playing" && this.everyoneAnswered()) {
      this.endRound();
      return;
    }

    this.broadcastState();
  }

  onError(conn: Party.Connection<TConnectionState>) {
    this.onClose(conn);
  }

  private handleJoin(
    message: Extract<TClientMessage, { type: "join" }>,
    conn: Party.Connection<TConnectionState>
  ) {
    const { playerId, name, image } = message;
    if (!playerId || !name) {
      this.sendError(conn, "Missing player info");
      return;
    }

    const existing = this.players.get(playerId);
    if (existing) {
      //reconnect: same person, keep their score
      existing.connected = true;
      existing.name = name;
      existing.image = image;
    } else {
      this.players.set(playerId, {
        id: playerId,
        name,
        image,
        score: 0,
        ready: false,
        connected: true,
        answer: null,
        answeredAt: null,
      });
    }

    conn.setState({ playerId });
    this.migrateHostIfNeeded();
    this.broadcastState();
  }

  private handleSetPlaylist(
    message: Extract<TClientMessage, { type: "set_playlist" }>,
    player: TInternalPlayer,
    conn: Party.Connection<TConnectionState>
  ) {
    if (player.id !== this.hostId || this.phase !== "lobby") return;

    const tracks = (message.tracks ?? []).filter(
      (track) => track?.uri && track?.name && track?.artist
    );

    if (tracks.length < MIN_TRACKS) {
      this.sendError(
        conn,
        `That playlist needs at least ${MIN_TRACKS} playable tracks`
      );
      return;
    }

    this.tracks = tracks;
    this.playlistName = message.playlistName || "Playlist";
    this.usedTrackIndexes.clear();
    this.broadcastState();
  }

  private handleStart(
    player: TInternalPlayer,
    conn: Party.Connection<TConnectionState>
  ) {
    if (player.id !== this.hostId || this.phase !== "lobby") return;

    if (this.tracks.length < MIN_TRACKS) {
      this.sendError(conn, "Pick a playlist first");
      return;
    }

    if (!this.connectedPlayers().every((p) => p.ready)) {
      this.sendError(conn, "Everyone needs to be ready");
      return;
    }

    this.startRound(1);
  }

  private handleAnswer(choiceIndex: number, player: TInternalPlayer) {
    if (
      this.phase !== "playing" ||
      !this.round ||
      player.answer !== null ||
      !Number.isInteger(choiceIndex) ||
      choiceIndex < 0 ||
      choiceIndex >= this.round.options.length ||
      Date.now() > this.round.deadline
    ) {
      return;
    }

    player.answer = choiceIndex;
    player.answeredAt = Date.now();

    if (this.everyoneAnswered()) {
      this.endRound();
    } else {
      this.broadcastState();
    }
  }

  private startRound(number: number) {
    this.clearTimer();

    //recycle the pool once every track has been played
    if (this.usedTrackIndexes.size >= this.tracks.length) {
      this.usedTrackIndexes.clear();
    }

    let trackIndex: number;
    do {
      trackIndex = Math.floor(Math.random() * this.tracks.length);
    } while (this.usedTrackIndexes.has(trackIndex));
    this.usedTrackIndexes.add(trackIndex);

    const track = this.tracks[trackIndex];
    const { options, correctIndex } = this.buildOptions(track);

    //random start point, but keep at least 30s of runway (same rule as single player)
    const positionMs = Math.floor(
      Math.random() * Math.max(track.durationMs - 30_000, 1)
    );

    Array.from(this.players.values()).forEach((player) => {
      player.answer = null;
      player.answeredAt = null;
    });

    this.round = {
      number,
      track,
      options,
      correctIndex,
      positionMs,
      deadline: Date.now() + GUESS_WINDOW_MS,
    };
    this.phase = "playing";
    this.timer = setTimeout(() => this.endRound(), GUESS_WINDOW_MS);
    this.broadcastState();
  }

  private buildOptions(correctTrack: TSimpleTrack) {
    const correct: TChoice = {
      name: correctTrack.name,
      artist: correctTrack.artist,
    };

    //dedupe decoys by song + artist and drop the correct answer
    const decoyMap = new Map<string, TChoice>();
    for (const track of this.tracks) {
      const isCorrect =
        track.name === correct.name && track.artist === correct.artist;
      if (!isCorrect) {
        decoyMap.set(`${track.name} - ${track.artist}`, {
          name: track.name,
          artist: track.artist,
        });
      }
    }

    const decoys = shuffle(Array.from(decoyMap.values())).slice(0, 3);
    const options = shuffle([correct, ...decoys]);
    const correctIndex = options.findIndex(
      (option) =>
        option.name === correct.name && option.artist === correct.artist
    );

    return { options, correctIndex };
  }

  private endRound() {
    this.clearTimer();
    const round = this.round;
    if (!round || this.phase !== "playing") return;

    const answers: TRoundResult["answers"] = {};
    for (const player of Array.from(this.players.values())) {
      const correct = player.answer === round.correctIndex;
      let gained = 0;
      if (correct && player.answeredAt !== null) {
        const remaining = Math.max(round.deadline - player.answeredAt, 0);
        gained =
          BASE_POINTS +
          Math.round(MAX_SPEED_BONUS * (remaining / GUESS_WINDOW_MS));
      }
      player.score += gained;
      answers[player.id] = { choiceIndex: player.answer, correct, gained };
    }

    this.lastResult = {
      roundNumber: round.number,
      correctIndex: round.correctIndex,
      track: {
        name: round.track.name,
        artist: round.track.artist,
        image: round.track.image,
      },
      answers,
    };
    this.phase = "reveal";
    this.timer = setTimeout(() => this.advance(), REVEAL_MS);
    this.broadcastState();
  }

  private advance() {
    this.clearTimer();
    if (!this.round) return;

    if (this.round.number >= TOTAL_ROUNDS) {
      this.phase = "gameover";
      this.round = null;
      this.broadcastState();
    } else {
      this.startRound(this.round.number + 1);
    }
  }

  private resetToLobby() {
    this.clearTimer();
    for (const [id, player] of Array.from(this.players.entries())) {
      if (!player.connected) {
        this.players.delete(id);
        continue;
      }
      player.score = 0;
      player.ready = false;
      player.answer = null;
      player.answeredAt = null;
    }
    this.phase = "lobby";
    this.round = null;
    this.lastResult = null;
    this.usedTrackIndexes.clear();
    this.migrateHostIfNeeded();
    this.broadcastState();
  }

  private migrateHostIfNeeded() {
    const host = this.hostId ? this.players.get(this.hostId) : null;
    if (host?.connected) return;
    this.hostId = this.connectedPlayers()[0]?.id ?? null;
  }

  private connectedPlayers() {
    return Array.from(this.players.values()).filter((p) => p.connected);
  }

  private everyoneAnswered() {
    const connected = this.connectedPlayers();
    return connected.length > 0 && connected.every((p) => p.answer !== null);
  }

  private getPlayer(conn: Party.Connection<TConnectionState>) {
    const playerId = conn.state?.playerId;
    return playerId ? this.players.get(playerId) ?? null : null;
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private sendError(conn: Party.Connection<TConnectionState>, message: string) {
    const payload: TServerMessage = { type: "error", message };
    conn.send(JSON.stringify(payload));
  }

  private broadcastState() {
    const players: TPublicPlayer[] = Array.from(this.players.values()).map(
      (player) => ({
        id: player.id,
        name: player.name,
        image: player.image,
        score: player.score,
        ready: player.ready,
        connected: player.connected,
        hasAnswered: player.answer !== null,
      })
    );

    //round info goes out WITHOUT the correct index — that only ships in lastResult after reveal
    const state: TRoomState = {
      phase: this.phase,
      hostId: this.hostId,
      players,
      playlistName: this.playlistName,
      trackCount: this.tracks.length,
      totalRounds: TOTAL_ROUNDS,
      round: this.round
        ? {
            number: this.round.number,
            trackUri: this.round.track.uri,
            positionMs: this.round.positionMs,
            snippetMs: SNIPPET_MS,
            options: this.round.options,
            deadline: this.round.deadline,
          }
        : null,
      lastResult: this.phase === "lobby" ? null : this.lastResult,
    };

    const payload: TServerMessage = { type: "state", state };
    this.room.broadcast(JSON.stringify(payload));
  }
}
