"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PlayButton from "./components/PlayButton";
import SearchList from "./components/SearchList";
import TrackDetails from "./components/TrackDetails";
import LoseModal from "./components/LoseModal";
import PlayerWrapper from "./components/PlayerWrapper";
import GameScore from "./components/Score";
import SearchInput from "./components/SearchInput";
import Result from "./components/Result";
import ModeSelect from "./components/ModeSelect";
import AnswerSelect from "./components/AnswerSelect";
import PlaylistPicker from "./components/PlaylistPicker";
import ChoiceGrid from "./components/ChoiceGrid";
import { useSearch } from "./hooks/useSearch";
import { useSpotifyPlayer } from "./hooks/useSpotifyPlayer";
import { TAnswerMode, TChoiceOption, TChooseResult, TGameMode } from "./types";
import { usePreloadImage } from "./hooks/usePreloadImage";
import {
  changeScore,
  handleContinueTrack,
  handlePlayTrack,
} from "./utils/spotifyLogic";
import ProgressBar from "./components/ProgressBar";
import useDebounce from "@/hooks/useDebounce";
import { Score } from "./constants/score";
import { GuessingAttempt } from "./constants/guessingAttempt";
import {
  getMostListenedTrackList,
  getPlaylistTrackList,
} from "./utils/spotifyApi";
import { generateChoiceOptions } from "./utils/choiceOptions";

const initialChooseResultValue = {
  isChoose: false,
  isCorrect: false,
};

//main component
const Page = () => {
  const router = useRouter();
  const [searchString, setSearchString] = useState("");
  const debouncedSearch = useDebounce(searchString);
  const [chooseResult, setChooseResult] = useState<TChooseResult>(
    initialChooseResultValue
  );
  const [currentScore, setCurrentScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [isLose, setIsLose] = useState(false);
  const [gameMode, setGameMode] = useState<TGameMode | null>(null);
  const [answerMode, setAnswerMode] = useState<TAnswerMode | null>(null);
  const [choiceOptions, setChoiceOptions] = useState<TChoiceOption[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
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

  //start a round & build the multiple choice options for it
  const startRound = async () => {
    const track = await handlePlayTrack(
      playerState,
      setPlayerState,
      setChooseResult
    );

    if (track && answerMode === "multipleChoice") {
      setChoiceOptions(generateChoiceOptions(track, playerState.trackList));
    }
  };

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
      changeScore(
        currentScore,
        setCurrentScore,
        highestScore,
        setHighestScore,
        playerState.songInterval,
        Score.INCREMENT
      );

      //if user didn't choose the correct awnser
    } else {
      setChooseResult((prev) => ({
        ...prev,
        isCorrect: false,
        isChoose: true,
      }));

      //update score
      changeScore(
        currentScore,
        setCurrentScore,
        highestScore,
        setHighestScore,
        playerState.songInterval,
        Score.DECREMENT
      );

      //showing losing screen
      if (currentScore <= 0) {
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
    setCurrentScore(0);

    //reset highestScore back to 0
    setHighestScore(0);

    //remove loseModal visibility state
    modalRef.current?.removeAttribute("open");

    //play the next track
    startRound();
  };

  const handleSelectMode = async (mode: TGameMode) => {
    setPlaylistError("");

    //party mode lives on its own route with live rooms
    if (mode === "multiplayer") {
      router.push("/multiplayer");
      return;
    }

    //playlist mode needs a playlist choice first, so trackList stays empty
    if (mode === "playlist") {
      setGameMode(mode);
      return;
    }

    //top tracks mode can load its track pool right away
    setIsLoadingTracks(true);
    const trackList = await getMostListenedTrackList();
    setPlayerState((prev) => ({ ...prev, trackList }));
    setIsLoadingTracks(false);
    setGameMode(mode);
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    setPlaylistError("");
    setIsLoadingTracks(true);
    const trackList = await getPlaylistTrackList(playlistId);
    setIsLoadingTracks(false);

    //keep the user in the picker if the playlist has nothing playable
    if (!trackList?.items?.length) {
      setPlaylistError("This playlist has no playable tracks");
      return;
    }

    setPlayerState((prev) => ({ ...prev, trackList }));
  };

  const handleChangeMode = () => {
    const { player } = playerState;

    //stop whatever is playing
    player?.pause();

    //reset the whole game state
    setIsLose(false);
    setCurrentScore(0);
    setHighestScore(0);
    setSearchString("");
    setChooseResult(initialChooseResultValue);
    setChoiceOptions([]);
    modalRef.current?.removeAttribute("open");

    //reset player state & clear the track pool
    setPlayerState((prev) => ({
      ...prev,
      trackList: null,
      currentTrack: null,
      isPlaying: false,
      isPausing: false,
      isClicked: false,
      isContinue: false,
      songInterval: GuessingAttempt.FIRST_TIME,
    }));

    //back to mode selection
    setGameMode(null);
    setAnswerMode(null);
    setPlaylistError("");
  };

  //setup screens: mode -> answer style -> playlist (if playlist mode)
  const isPickingPlaylist =
    gameMode === "playlist" && !!answerMode && !playerState.trackList;

  if (!gameMode || !answerMode || isPickingPlaylist) {
    return (
      <PlayerWrapper playerState={playerState}>
        {isLoadingTracks ? (
          <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Loading tracks...
            </p>
          </div>
        ) : !gameMode ? (
          <ModeSelect handleSelectMode={handleSelectMode} />
        ) : !answerMode ? (
          <AnswerSelect
            handleSelectAnswerMode={setAnswerMode}
            handleBack={() => {
              setGameMode(null);
              setPlayerState((prev) => ({ ...prev, trackList: null }));
            }}
          />
        ) : (
          <PlaylistPicker
            handleSelectPlaylist={handleSelectPlaylist}
            handleBack={() => setAnswerMode(null)}
            errorMessage={playlistError}
          />
        )}
      </PlayerWrapper>
    );
  }

  return (
    <PlayerWrapper playerState={playerState}>
      <GameScore isLose={isLose} score={currentScore} />

      <div className="flex flex-col items-center pt-20">
        <LoseModal
          songName={playerState.currentTrack?.name as string}
          artistName={playerState.currentTrack?.artists[0].name as string}
          highScore={highestScore}
          image={preloadImage}
          chooseResult={chooseResult}
          score={currentScore}
          handlePlayAgain={handlePlayAgain}
          handleChangeMode={handleChangeMode}
          ref={modalRef}
        />
        {!isLose && (
          <div className="flex flex-col gap-4">
            <PlayButton
              handlePlayTrack={startRound}
              handleContinueTrack={() =>
                handleContinueTrack(playerState, setPlayerState)
              }
              playerState={playerState}
              chooseResult={chooseResult}
            />
            {answerMode === "search" && (
              <SearchInput
                playerState={playerState}
                setSearchString={setSearchString}
                chooseResult={chooseResult}
              />
            )}
            {!playerState.isPlaying && !playerState.isClicked && (
              <button
                className="text-xs uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
                onClick={handleChangeMode}
              >
                Change mode
              </button>
            )}
          </div>
        )}

        {/* search result */}
        {answerMode === "search" && (
          <SearchList
            searchResultList={searchResultList}
            handleChooseSearch={handleChooseSearch}
            chooseResult={chooseResult}
          />
        )}

        {/* multiple choice options */}
        {answerMode === "multipleChoice" && !isLose && (
          <ChoiceGrid
            options={choiceOptions}
            playerState={playerState}
            chooseResult={chooseResult}
            handleChoose={handleChooseSearch}
          />
        )}

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
          score={currentScore}
        />

        {/* show result */}
        <Result chooseResult={chooseResult} score={currentScore} />
      </div>
    </PlayerWrapper>
  );
};

export default Page;
