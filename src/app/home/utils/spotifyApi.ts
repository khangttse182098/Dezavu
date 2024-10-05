const playInterval = (duration: number, player: Spotify.Player) => {
  player.getCurrentState().then((state) => {
    //check if song is currently playing
    if (state) {
      console.log("Playing in interval...");
      //until hitting duration, pause the song
      setTimeout(() => {
        player.pause();
      }, duration * 1000);
    }
  });
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
      playInterval(1, player);
      console.log("Currently playing...");
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
