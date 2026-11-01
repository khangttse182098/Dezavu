import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PlaylistPicker from "@/app/home/components/PlaylistPicker";
import { getPlaylistTrackList } from "@/app/home/utils/spotifyApi";
import { MIN_TRACKS, TClientMessage, TRoomState } from "@/shared/multiplayer";
import { simplifyTracks } from "../utils/simplifyTracks";
import PlayerAvatar from "./PlayerAvatar";

const Lobby = ({
  code,
  roomState,
  meId,
  send,
  error,
  clearError,
}: {
  code: string;
  roomState: TRoomState;
  meId: string;
  send: (message: TClientMessage) => void;
  error: string;
  clearError: () => void;
}) => {
  const router = useRouter();
  const [isPickingPlaylist, setIsPickingPlaylist] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [playlistError, setPlaylistError] = useState("");

  const isHost = roomState.hostId === meId;
  const me = roomState.players.find((player) => player.id === meId);
  const connectedPlayers = roomState.players.filter(
    (player) => player.connected
  );
  const everyoneReady =
    connectedPlayers.length > 0 &&
    connectedPlayers.every((player) => player.ready);
  const hasPlaylist = roomState.trackCount >= MIN_TRACKS;
  const canStart = isHost && hasPlaylist && everyoneReady;

  const handleSelectPlaylist = async (
    playlistId: string,
    playlistName: string
  ) => {
    setPlaylistError("");
    setIsLoadingTracks(true);
    const trackList = await getPlaylistTrackList(playlistId);
    setIsLoadingTracks(false);

    const tracks = simplifyTracks(trackList);
    if (tracks.length < MIN_TRACKS) {
      setPlaylistError(
        `This playlist needs at least ${MIN_TRACKS} playable tracks`
      );
      return;
    }

    send({ type: "set_playlist", playlistName, tracks });
    setIsPickingPlaylist(false);
  };

  //host-only playlist picking screen (reuses the single-player picker)
  if (isPickingPlaylist) {
    if (isLoadingTracks) {
      return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Loading tracks...
          </p>
        </div>
      );
    }
    return (
      <PlaylistPicker
        handleSelectPlaylist={handleSelectPlaylist}
        handleBack={() => setIsPickingPlaylist(false)}
        errorMessage={playlistError}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-6 py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          Room code
        </p>
        <h1 className="mt-2 font-display text-7xl tracking-[0.15em] text-white sm:text-8xl">
          {code}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Share it with your friends to let them join
        </p>
      </div>

      {error && (
        <button
          className="text-xs uppercase tracking-[0.2em] text-red-500"
          onClick={clearError}
        >
          {error} &times;
        </button>
      )}

      {/* players */}
      <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {roomState.players.map((player) => (
          <li
            key={player.id}
            className={`flex items-center gap-4 rounded-sm border border-neutral-800 bg-neutral-950 px-5 py-4 ${
              player.connected ? "" : "opacity-40"
            }`}
          >
            <PlayerAvatar
              name={player.name}
              image={player.image}
              dimmed={!player.connected}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-white">
                {player.name}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {player.id === roomState.hostId ? "Host" : "Player"}
                {player.id === meId && " · You"}
              </span>
            </span>
            <span
              className={`text-[10px] uppercase tracking-[0.2em] ${
                player.ready ? "text-accent" : "text-neutral-600"
              }`}
            >
              {player.ready ? "Ready" : "Not ready"}
            </span>
          </li>
        ))}
      </ul>

      {/* playlist */}
      <div className="flex w-full items-center justify-between gap-4 rounded-sm border border-neutral-800 bg-neutral-950 px-5 py-4">
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Playlist
          </span>
          <span className="block truncate text-sm font-bold text-white">
            {hasPlaylist
              ? `${roomState.playlistName} · ${roomState.trackCount} tracks`
              : isHost
              ? "Pick a playlist to play from"
              : "Waiting for the host to pick"}
          </span>
        </span>
        {isHost && (
          <button
            className="shrink-0 rounded-sm border border-neutral-700 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-accent hover:text-white"
            onClick={() => setIsPickingPlaylist(true)}
          >
            {hasPlaylist ? "Change" : "Pick playlist"}
          </button>
        )}
      </div>

      {/* actions */}
      <div className="flex flex-col items-center gap-4">
        <button
          className={`h-14 w-72 rounded-sm text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
            me?.ready
              ? "border border-accent text-accent hover:bg-neutral-900"
              : "bg-accent text-black hover:bg-accent-dark"
          }`}
          onClick={() => send({ type: "ready", ready: !me?.ready })}
        >
          {me?.ready ? "Ready ✓ (tap to unready)" : "I'm ready"}
        </button>

        {isHost && (
          <>
            <button
              className="h-14 w-72 rounded-sm bg-white text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
              disabled={!canStart}
              onClick={() => send({ type: "start" })}
            >
              Start game
            </button>
            {!canStart && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                {!hasPlaylist
                  ? "Pick a playlist to start"
                  : "Waiting for everyone to be ready"}
              </p>
            )}
          </>
        )}

        <button
          className="text-xs uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
          onClick={() => router.push("/home")}
        >
          &larr; Leave room
        </button>
      </div>
    </div>
  );
};

export default Lobby;
