import { createContext, useState } from "react";

interface TSpotifyPlayerContext {
  spotifyPlayer: Spotify.Player | null;
  setSpotifyPlayer: React.Dispatch<React.SetStateAction<Spotify.Player | null>>;
}

export const SpotifyPlayerContext = createContext<TSpotifyPlayerContext>({
  spotifyPlayer: null,
  setSpotifyPlayer: () => {},
});

export const SpotifyPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [spotifyPlayer, setSpotifyPlayer] = useState<Spotify.Player | null>(
    null
  );
  const value = { spotifyPlayer, setSpotifyPlayer };

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};
