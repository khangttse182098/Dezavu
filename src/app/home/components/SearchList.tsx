import React from "react";
import { TChooseResult } from "../types";

const SearchList = ({
  searchResultList,
  handleChooseSearch,
  chooseResult,
}: {
  searchResultList: SpotifyApi.TrackSearchResponse | null;
  handleChooseSearch: (trackName: string, artistName: string) => void;
  chooseResult: TChooseResult;
}) => {
  const hasResults =
    searchResultList &&
    !chooseResult.isCorrect &&
    searchResultList.tracks.items.length > 0;

  return (
    <>
      {hasResults && (
        <ul className="mt-2 w-72 divide-y divide-neutral-800 overflow-hidden rounded-sm border border-neutral-800">
          {searchResultList.tracks.items.map((track, index) => (
            <li key={index}>
              <button
                className="w-full bg-neutral-900 px-4 py-3 text-left transition-colors hover:bg-neutral-800"
                onClick={() =>
                  handleChooseSearch(track.name, track.album.artists[0].name)
                }
              >
                <h1 className="truncate text-sm font-bold text-white">
                  {track.name}
                </h1>
                <p className="truncate text-xs text-neutral-400">
                  {track.album.artists[0].name}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default SearchList;
