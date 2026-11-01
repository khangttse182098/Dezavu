//start the round's track on THIS player's device and pause it after the snippet
//every player in the room runs this against their own Spotify account
export const playSnippet = async (
  trackUri: string,
  positionMs: number,
  snippetMs: number,
  accessToken: string,
  deviceId: string,
  player: Spotify.Player
): Promise<ReturnType<typeof setTimeout> | null> => {
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
        position_ms: positionMs,
      }),
    });

    if (!response.ok) {
      //a track can be unplayable in this player's market — the round continues without audio
      console.error("Error playing snippet:", await response.json());
      return null;
    }

    return setTimeout(() => {
      player.pause();
    }, snippetMs);
  } catch (error) {
    console.error("Network error playing snippet:", error);
    return null;
  }
};
