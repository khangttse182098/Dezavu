export const playTrackByUri = async (
  trackUri: string,
  accessToken: string,
  deviceId: string
) => {
  const url = `${process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL}/me/player/play?device_id=${deviceId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });

    if (response.ok) {
      console.log("Track is playing");
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
