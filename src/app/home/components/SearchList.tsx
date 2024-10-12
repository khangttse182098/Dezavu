import React from "react";

const SearchList = ({
  searchResultList,
  handleChooseSearch,
}: {
  searchResultList: SpotifyApi.TrackSearchResponse | null;
  handleChooseSearch: (trackName: string, artistName: string) => void;
}) => {
  return (
    <ul className="rounded-lg">
      {searchResultList &&
        searchResultList?.tracks.items.map((track, index) => (
          <li key={index}>
            <div
              className="w-56 h-14 bg-white px-2 border-slate-300  hover:bg-slate-300 transition-all"
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
