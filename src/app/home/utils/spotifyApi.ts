const playInterval = (duration: number, player: Spotify.Player) => {
  console.log("Playing in interval...");
  setTimeout(() => {
    player.pause();
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
  player: Spotify.Player
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
      console.log("Currently playing...");
      //set duration that the song is playing in
      playInterval(3, player);
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
