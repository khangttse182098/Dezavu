import { TPlayerState } from "../types";

//play the song for x seconds
export const playInterval = (
  duration: number,
  player: Spotify.Player,
  setPlayerState: React.Dispatch<React.SetStateAction<TPlayerState>>
) => {
  console.log("Playing in interval...");
  setTimeout(() => {
    player.pause().then(() => {
      console.log("successfully paused!");
      //set isPause to true
      setPlayerState((prev) => ({ ...prev, isPausing: true }));

      //set isPlaying to false
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));

      //set isContinue to true
      setPlayerState((prev) => ({ ...prev, isContinue: true }));
    });
  }, duration * 1000);
};

//getTrackDetailById
export const getTrackDetailById = async (accessToken: string, id: string) => {
  const url = `${process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL}/tracks/${id}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      console.log("Successfully getting track detail");
      return await res.json();
    } else {
      const error = await res.json();
      console.error("Error getting track detail:", error);
    }
  } catch (error) {}
};

//playTrackByUri
export const playTrackByUri = async (
  trackUri: string,
  accessToken: string,
  position: number,
  deviceId: string,
  player: Spotify.Player,
  songInterval: number,
  setPlayerState: React.Dispatch<React.SetStateAction<TPlayerState>>,
  duration: number
) => {
  const url = `${process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL}/me/player/play/?device_id=${deviceId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [trackUri],
        position_ms: position,
      }),
    });

    if (response.ok) {
      // Once the song is playing, call playInterval() function
      player.addListener("player_state_changed", (state) => {
        if (
          state &&
          state.duration === duration &&
          state.position === position &&
          !state.loading &&
          !state.paused
        ) {
          console.log(state);

          console.log("Track is now playing");

          //set isPlaying to true (use to show the search bar or not)
          setPlayerState((prev) => ({ ...prev, isPlaying: true }));

          //set isClicked back to false
          setPlayerState((prev) => ({ ...prev, isClicked: false }));

          // Once the song is playing, call playInterval
          playInterval(songInterval, player, setPlayerState);
          // Optionally, remove the event listener after it's no longer needed
          player.removeListener("player_state_changed");
        }
      });
    } else {
      const error = await response.json();
      console.error("Error playing track:", error);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};

export const getMostListenedTrackList = async () => {
  const res = await fetch("http://localhost:3000/api/track");
  return await res.json();
};

export const searchTracks = async (
  searchString: string,
  accessToken: string
): Promise<SpotifyApi.TrackSearchResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL}/search?q=${searchString}&type=track&limit=4`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await res.json();
  console.log(data);
  return data;
};
