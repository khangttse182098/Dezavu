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
  return (
    <ul>
      {searchResultList &&
        !chooseResult.isCorrect &&
        searchResultList?.tracks.items.map((track, index) => (
          <li key={index}>
            <div
              className={`w-56 min-h-14 bg-white px-2 border-b ${
                index !== searchResultList?.tracks.items.length - 1 &&
                "border-b-slate-500"
              } hover:bg-slate-300 transition-all ${
                index === 0 && "rounded-t-md"
              } ${
                index === searchResultList?.tracks.items.length - 1 &&
                "rounded-b-md"
              }`}
              onClick={() =>
                handleChooseSearch(track.name, track.album.artists[0].name)
              }
            >
              <h1 className="font-bold text-md">{track.name}</h1>
              <p className="text-sm">{track.album.artists[0].name}</p>
            </div>
          </li>
        ))}
    </ul>
  );
};

export default SearchList;
