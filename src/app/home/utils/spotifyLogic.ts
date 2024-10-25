import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { TChooseResult, TPlayerState } from "../types";
import { getTrackDetailById, playInterval, playTrackByUri } from "./spotifyApi";
import { randomize } from "@/utils/randomize";
import { GuessingAttempt } from "../constants/guessingAttempt";
import { Score } from "../constants/score";

export const changeSongInterval = (songInterval: number) => {
  if (songInterval === GuessingAttempt.FIRST_TIME) {
    return GuessingAttempt.SECOND_TIME;
  } else if (songInterval === GuessingAttempt.SECOND_TIME) {
    return GuessingAttempt.THIRD_TIME;
  } else if (songInterval === GuessingAttempt.THIRD_TIME) {
    return GuessingAttempt.FOURTH_TIME;
  } else if (songInterval === GuessingAttempt.FOURTH_TIME) {
    return GuessingAttempt.FIFTH_TIME;
  }
};

export const changeScore = (
  currentScore: number,
  setCurrentScore: Dispatch<SetStateAction<number>>,
  highestScore: number,
  setHighestScore: Dispatch<SetStateAction<number>>,
  songInterval: number,
  mode: string
) => {
  if (mode === Score.INCREMENT) {
    //update score
    let roundScore = 0;
    if (songInterval === GuessingAttempt.FIRST_TIME) {
      roundScore = Score.FIRST_TIME;
    } else if (songInterval === GuessingAttempt.SECOND_TIME) {
      roundScore = Score.SECOND_TIME;
    } else if (songInterval === GuessingAttempt.THIRD_TIME) {
      roundScore = Score.THIRD_TIME;
    } else if (songInterval === GuessingAttempt.FOURTH_TIME) {
      roundScore = Score.FOURTH_TIME;
    } else if (songInterval === GuessingAttempt.FIFTH_TIME) {
      roundScore = Score.FIFTH_TIME;
    }

    let newCurrentScore = roundScore + currentScore;

    //check if score is new high score
    if (highestScore < newCurrentScore) {
      setHighestScore(newCurrentScore);
    }

    //update the score state
    setCurrentScore(newCurrentScore);

    // decrement case
  } else if (mode === Score.DECREMENT) {
    setCurrentScore((prev) => prev - Score.FIRST_TIME);
  }
};

export const handleContinueTrack = async (
  playerState: TPlayerState,
  setPlayerState: Dispatch<SetStateAction<TPlayerState>>
) => {
  const { player, songInterval } = playerState;

  //check if this is the last time we should increment songInterval
  if (songInterval < 14) {
    //get new songInterval
    const newSongInterval = changeSongInterval(songInterval);
    player?.togglePlay();
    player?.addListener("player_state_changed", (state) => {
      if (state && !state.loading && !state.paused) {
        setPlayerState((prev) => ({ ...prev, isPlaying: true }));
        playInterval(
          newSongInterval as number,
          playerState.player as Spotify.Player,
          setPlayerState
        );

        //update songInterval state
        setPlayerState((prev) => ({
          ...prev,
          songInterval: newSongInterval as number,
        }));

        //remove player state changed listener
        player.removeListener("player_state_changed");
      }
    });
  }
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

    //set songInterval to 1
    setPlayerState((prev) => ({
      ...prev,
      songInterval: GuessingAttempt.FIRST_TIME,
    }));

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
      playerState.songInterval,
      setPlayerState,
      trackDuration
    );
  }
};
