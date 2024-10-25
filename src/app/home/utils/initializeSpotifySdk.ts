import { TPlayerState } from "../types";

export const initializeSpotifySdk = (
  accessToken: string,
  setPlayerState: React.Dispatch<React.SetStateAction<TPlayerState>>
) => {
  //set up sdk
  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new window.Spotify.Player({
      name: "Web playback SDK",
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken as string);
      },
    });
    setPlayerState((prev) => ({
      ...prev,
      player,
    }));

    player.addListener("ready", ({ device_id }: { device_id: string }) => {
      setPlayerState((prev) => ({
        ...prev,
        deviceId: device_id,
      }));
    });

    player.connect().then((success) => {
      if (success) {
        console.log("The Web Playback SDK successfully connected to Spotify!");

        setPlayerState((prev) => ({ ...prev, isReady: true }));
      }
    });
  };

  // Check if the SDK script is already appended
  const existingScript = document.querySelector(
    'script[src="https://sdk.scdn.co/spotify-player.js"]'
  );

  if (existingScript) {
    console.log("Spotify Web Playback SDK script is already loaded.");
    setPlayerState((prev) => ({
      ...prev,
      sdkReady: true,
    }));
    return;
  } else {
    // Append SDK script if it doesn't exist
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    script.onload = () => {
      console.log("Spotify Web Playback SDK script loaded successfully.");
      setPlayerState((prev) => ({
        ...prev,
        sdkReady: true,
      }));
    };
    document.body.appendChild(script);
  }
};
