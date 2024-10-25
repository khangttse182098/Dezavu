import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { TChooseResult, TPlayerState } from "../types";
import { getTrackDetailById, playInterval, playTrackByUri } from "./spotifyApi";
import { randomize } from "@/utils/randomize";

export const handleContinueTrack = async (
  playerState: TPlayerState,
  setPlayerState: Dispatch<SetStateAction<TPlayerState>>
) => {
  const { player } = playerState;
  player?.togglePlay();
  player?.addListener("player_state_changed", (state) => {
    if (state && !state.loading && !state.paused) {
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
      playInterval(2, playerState.player as Spotify.Player, setPlayerState);

      //remove player state changed listener
      player.removeListener("player_state_changed");
    }
  });
};

export const handlePlayTrack = async (
  playerState: TPlayerState,
  setPlayerState: Dispatch<SetStateAction<TPlayerState>>,
  setChooseResult: Dispatch<SetStateAction<TChooseResult>>
) => {
  const { accessToken, trackList, deviceId, isReady, sdkReady, player } =
    playerState;

  if (accessToken && trackList && deviceId && isReady && sdkReady && player) {
    //pause previous track if currently play
    player.pause();

    //reset choosing state
    setChooseResult((prev) => ({
      ...prev,
      isCorrect: false,
      isChoose: false,
    }));

    //set isClicked to true
    setPlayerState((prev) => ({ ...prev, isClicked: true }));

    //get random track's id
    const trackNumber = randomize(trackList.items.length as number);
    const trackId = trackList.items[trackNumber].id;
    console.log(`TrackId: ${trackId}`);

    //get random track uri
    const trackUri = trackList.items[trackNumber].uri;
    console.log(`TrackUri: ${trackUri}`);

    //get random track's detail
    const trackDetail = await getTrackDetailById(accessToken, trackId);
    setPlayerState((prev) => ({ ...prev, currentTrack: trackDetail }));
    const trackDuration = trackDetail.duration_ms;

    //subtract 30s from the end
    const subtractedTrackTime = trackDuration - 30000;

    //get random track duration
    const randomTrackDuration = randomize(subtractedTrackTime);
    console.log(`RandomTrackDuration: ${randomTrackDuration}`);

    // play the track
    await playTrackByUri(
      trackUri,
      accessToken,
      randomTrackDuration,
      deviceId as string,
      player as Spotify.Player,
      setPlayerState,
      trackDuration
    );
  }
};

// export const handleChooseSearch = (
//   songName: string,
//   artistName: string,
//   playerState: TPlayerState,
//   score: number,
//   highestScore: number,
//   modalRef: MutableRefObject<HTMLDialogElement | null>,
//   setPlayerState: Dispatch<SetStateAction<TPlayerState>>,
//   setSearchString: Dispatch<SetStateAction<string>>,
//   setChooseResult: Dispatch<SetStateAction<TChooseResult>>,
//   setScore: Dispatch<SetStateAction<number>>,
//   setHighestScore: Dispatch<SetStateAction<number>>,
//   setIsLose: Dispatch<SetStateAction<boolean>>
// ) => {
//   const { currentTrack, player } = playerState;

//   //set isPlay to true (use to show the search bar or not)
//   setPlayerState((prev) => ({ ...prev, isPlaying: false }));

//   //reset search state
//   setSearchString("");

//   //pause the track & play
//   player?.pause();
//   player?.togglePlay();

//   //if user choose correct search result
//   if (
//     currentTrack?.name === songName &&
//     currentTrack.artists[0].name === artistName
//   ) {
//     setChooseResult((prev) => ({ ...prev, isCorrect: true, isChoose: true }));
//     //update score
//     setScore((prev) => prev + 1);

//     //check if score is new high score
//     {
//       highestScore < score + 1 && setHighestScore(score + 1);
//     }

//     //if user didn't choose the correct awnser
//   } else {
//     setChooseResult((prev) => ({
//       ...prev,
//       isCorrect: false,
//       isChoose: true,
//     }));
//     //update score
//     const updatedScore = score - 1;
//     setScore(updatedScore);

//     //showing losing screen
//     if (updatedScore <= 0) {
//       modalRef.current?.setAttribute("open", "true");
//       player?.pause();
//       setIsLose(true);
//     }
//   }
// };
