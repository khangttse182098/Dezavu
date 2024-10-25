"use client";

import { useRef, useState } from "react";
import PlayButton from "./components/PlayButton";
import SearchList from "./components/SearchList";
import TrackDetails from "./components/TrackDetails";
import LoseModal from "./components/LoseModal";
import PlayerWrapper from "./components/PlayerWrapper";
import Score from "./components/Score";
import SearchInput from "./components/SearchInput";
import Result from "./components/Result";
import { useSearch } from "./hooks/useSearch";
import { useSpotifyPlayer } from "./hooks/useSpotifyPlayer";
import { TChooseResult } from "./types";
import { usePreloadImage } from "./hooks/usePreloadImage";
import { handleContinueTrack, handlePlayTrack } from "./utils/spotifyLogic";
import ProgressBar from "./components/ProgressBar";
import useDebounce from "@/hooks/useDebounce";

const initialChooseResultValue = {
  isChoose: false,
  isCorrect: false,
};

//main component
const Page = () => {
  const [searchString, setSearchString] = useState("");
  const debouncedSearch = useDebounce(searchString);
  const [chooseResult, setChooseResult] = useState<TChooseResult>(
    initialChooseResultValue
  );
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [isLose, setIsLose] = useState(false);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  // get player state
  const { playerState, setPlayerState } = useSpotifyPlayer();

  // search result list
  const { searchResultList } = useSearch(
    debouncedSearch,
    playerState.accessToken
  );

  //load image in advance
  const { preloadImage } = usePreloadImage(
    playerState.currentTrack?.album.images[0].url
  );

  const handleChooseSearch = (songName: string, artistName: string) => {
    const { currentTrack, player } = playerState;

    //set isPlay to true (use to show the search bar or not)
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));

    //reset search state
    setSearchString("");

    //pause the track & play
    player?.pause();
    player?.togglePlay();

    //if user choose correct search result
    if (
      currentTrack?.name === songName &&
      currentTrack.artists[0].name === artistName
    ) {
      setChooseResult((prev) => ({ ...prev, isCorrect: true, isChoose: true }));
      //update score
      setScore((prev) => prev + 1);

      //check if score is new high score
      {
        highestScore < score + 1 && setHighestScore(score + 1);
      }

      //if user didn't choose the correct awnser
    } else {
      setChooseResult((prev) => ({
        ...prev,
        isCorrect: false,
        isChoose: true,
      }));
      //update score
      const updatedScore = score - 1;
      setScore(updatedScore);

      //showing losing screen
      if (updatedScore <= 0) {
        modalRef.current?.setAttribute("open", "true");
        player?.pause();
        setIsLose(true);
      }
    }
  };

  const handlePlayAgain = () => {
    //reset isLost state back to false
    setIsLose(false);

    //reset score back to 0
    setScore(0);

    //reset highestScore back to 0
    setHighestScore(0);

    //remove loseModal visibility state
    modalRef.current?.removeAttribute("open");

    //play the next track
    handlePlayTrack(playerState, setPlayerState, setChooseResult);
  };

  return (
    <PlayerWrapper playerState={playerState}>
      <Score isLose={isLose} score={score} />

      <div className="flex flex-col items-center">
        <LoseModal
          songName={playerState.currentTrack?.name as string}
          artistName={playerState.currentTrack?.artists[0].name as string}
          highScore={highestScore}
          image={preloadImage}
          chooseResult={chooseResult}
          score={score}
          handlePlayAgain={handlePlayAgain}
          ref={modalRef}
        />
        {!isLose && (
          <div className="flex flex-col gap-3">
            <PlayButton
              handlePlayTrack={() =>
                handlePlayTrack(playerState, setPlayerState, setChooseResult)
              }
              handleContinueTrack={() =>
                handleContinueTrack(playerState, setPlayerState)
              }
              playerState={playerState}
              chooseResult={chooseResult}
            />
            <SearchInput
              playerState={playerState}
              setSearchString={setSearchString}
              chooseResult={chooseResult}
            />
          </div>
        )}

        {/* search result */}
        <SearchList
          searchResultList={searchResultList}
          handleChooseSearch={handleChooseSearch}
          chooseResult={chooseResult}
        />

        {/* progress bar */}
        <ProgressBar
          chooseResult={chooseResult}
          songInterval={playerState.songInterval}
        />

        {/* show track detail */}
        <TrackDetails
          songName={playerState.currentTrack?.name as string}
          artistName={playerState.currentTrack?.artists[0].name as string}
          image={preloadImage}
          isBig={true}
          chooseResult={chooseResult}
          score={score}
        />

        {/* show result */}
        <Result chooseResult={chooseResult} score={score} />
      </div>
    </PlayerWrapper>
  );
};

export default Page;
