import React, { useEffect, useState } from "react";
import { getUserPlaylists } from "../utils/spotifyApi";

const PlaylistPicker = ({
  handleSelectPlaylist,
  handleBack,
  errorMessage,
}: {
  handleSelectPlaylist: (playlistId: string, playlistName: string) => void;
  handleBack: () => void;
  errorMessage: string;
}) => {
  const [playlists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[] | null
  >(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const userPlaylists = await getUserPlaylists();
      setPlaylists(Array.isArray(userPlaylists) ? userPlaylists : []);
    };
    fetchPlaylists();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-5xl text-white sm:text-6xl">
          YOUR PLAYLISTS<span className="text-accent">.</span>
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-neutral-500">
          Pick one to guess from
        </p>
      </div>

      {errorMessage && (
        <p className="text-xs uppercase tracking-[0.2em] text-red-500">
          {errorMessage}
        </p>
      )}

      {!playlists ? (
        //skeleton covers while loading
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-sm border border-neutral-800 bg-neutral-950 p-4"
            >
              <div className="aspect-square w-full rounded-sm bg-neutral-900" />
              <div className="mt-4 h-3 w-3/4 rounded-sm bg-neutral-900" />
              <div className="mt-2 h-2 w-1/3 rounded-sm bg-neutral-900" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          You have no playlists on Spotify yet
        </p>
      ) : (
        <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <button
                className="group flex w-full flex-col rounded-sm border border-neutral-800 bg-neutral-950 p-4 text-left transition-colors duration-200 hover:border-accent hover:bg-neutral-900"
                onClick={() => handleSelectPlaylist(playlist.id, playlist.name)}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-neutral-900">
                  {playlist.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-neutral-600">
                      ♪
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-2">
                  <h2 className="truncate text-sm font-bold text-white">
                    {playlist.name}
                  </h2>
                  <span
                    className="shrink-0 text-neutral-700 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent"
                    aria-hidden
                  >
                    &rarr;
                  </span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  {playlist.tracks.total}{" "}
                  {playlist.tracks.total === 1 ? "track" : "tracks"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        className="text-xs uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
        onClick={handleBack}
      >
        &larr; Back to modes
      </button>
    </div>
  );
};

export default PlaylistPicker;
