"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PlayerWrapper from "@/app/home/components/PlayerWrapper";
import { useSpotifyPlayer } from "@/app/home/hooks/useSpotifyPlayer";
import { TPlayerState } from "@/app/home/types";
import {
  GUESS_WINDOW_MS,
  isValidRoomCode,
  TRoomState,
} from "@/shared/multiplayer";
import Lobby from "../components/Lobby";
import RoundScreen from "../components/RoundScreen";
import RevealScreen from "../components/RevealScreen";
import GameOver from "../components/GameOver";
import { useRoom } from "../hooks/useRoom";
import { getPlayerId } from "../utils/playerId";
import { playSnippet } from "../utils/playSnippet";

const CenteredNote = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
    {children}
  </div>
);

//the actual room: only rendered once session, playerId and the spotify player exist
const Room = ({
  code,
  playerId,
  name,
  image,
  playerState,
}: {
  code: string;
  playerId: string;
  name: string;
  image: string | null;
  playerState: TPlayerState;
}) => {
  const { roomState, error, clearError, send } = useRoom({
    code,
    playerId,
    name,
    image,
  });

  //my locked-in answer for the current round (local echo; server is authoritative)
  const [myAnswer, setMyAnswer] = useState<{
    round: number;
    index: number;
  } | null>(null);

  const snippetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPlayedRound = useRef(0);

  const phase = roomState?.phase;
  const round = roomState?.round ?? null;

  //a new round arrived: start this player's snippet
  useEffect(() => {
    if (phase !== "playing" || !round) return;
    if (lastPlayedRound.current === round.number) return;
    lastPlayedRound.current = round.number;

    const { accessToken, deviceId, player } = playerState;
    if (!accessToken || !deviceId || !player) return;

    //late joiners come in mid-round: skip ahead so everyone hears the same part
    const elapsedMs = Math.max(
      GUESS_WINDOW_MS - (round.deadline - Date.now()),
      0
    );
    if (elapsedMs >= round.snippetMs) return;

    if (snippetTimer.current) clearTimeout(snippetTimer.current);
    playSnippet(
      round.trackUri,
      round.positionMs + elapsedMs,
      round.snippetMs - elapsedMs,
      accessToken,
      deviceId,
      player
    ).then((timer) => {
      snippetTimer.current = timer;
    });
  }, [phase, round, playerState]);

  //round ended (possibly early, when everyone answered): cut the audio
  useEffect(() => {
    if (phase === "reveal" || phase === "gameover" || phase === "lobby") {
      if (snippetTimer.current) {
        clearTimeout(snippetTimer.current);
        snippetTimer.current = null;
      }
      playerState.player?.pause();
    }
    if (phase === "lobby") {
      lastPlayedRound.current = 0;
      setMyAnswer(null);
    }
  }, [phase, playerState.player]);

  const handleAnswer = (choiceIndex: number) => {
    if (!round || myAnswer?.round === round.number) return;
    setMyAnswer({ round: round.number, index: choiceIndex });
    send({ type: "answer", choiceIndex });
  };

  if (!roomState) {
    return (
      <CenteredNote>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Joining room {code}...
        </p>
      </CenteredNote>
    );
  }

  const myAnswerIndex =
    round && myAnswer?.round === round.number ? myAnswer.index : null;

  switch (roomState.phase) {
    case "playing":
      return (
        <RoundScreen
          roomState={roomState}
          myAnswerIndex={myAnswerIndex}
          handleAnswer={handleAnswer}
        />
      );
    case "reveal":
      return <RevealScreen roomState={roomState} meId={playerId} />;
    case "gameover":
      return <GameOver roomState={roomState} meId={playerId} send={send} />;
    default:
      return (
        <Lobby
          code={code}
          roomState={roomState}
          meId={playerId}
          send={send}
          error={error}
          clearError={clearError}
        />
      );
  }
};

const Page = ({ params }: { params: { code: string } }) => {
  const code = decodeURIComponent(params.code).toUpperCase();
  const { data: session, status } = useSession();
  const [playerId, setPlayerId] = useState("");
  const { playerState } = useSpotifyPlayer();

  useEffect(() => {
    setPlayerId(getPlayerId());
  }, []);

  if (!isValidRoomCode(code)) {
    return (
      <CenteredNote>
        <p className="font-display text-4xl text-white">
          BAD CODE<span className="text-accent">.</span>
        </p>
        <Link
          href="/multiplayer"
          className="text-xs uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
        >
          &larr; Back to party mode
        </Link>
      </CenteredNote>
    );
  }

  if (status === "unauthenticated") {
    return (
      <CenteredNote>
        <p className="font-display text-4xl text-white">
          LOG IN FIRST<span className="text-accent">.</span>
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          You need a Spotify Premium account to play
        </p>
        <Link
          href="/"
          className="h-14 w-72 rounded-sm bg-accent text-center text-sm font-bold uppercase leading-[3.5rem] tracking-[0.2em] text-black transition-colors hover:bg-accent-dark"
        >
          Log in with Spotify
        </Link>
      </CenteredNote>
    );
  }

  if (status === "loading" || !playerId) {
    return (
      <CenteredNote>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Loading...
        </p>
      </CenteredNote>
    );
  }

  return (
    <PlayerWrapper playerState={playerState}>
      <Room
        code={code}
        playerId={playerId}
        name={session?.user?.name ?? "Player"}
        image={session?.user?.image ?? null}
        playerState={playerState}
      />
    </PlayerWrapper>
  );
};

export default Page;
