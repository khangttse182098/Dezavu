import { useEffect, useState } from "react";
import { searchTracks } from "../utils/spotifyApi";

export const useSearch = (searchString: string, accessToken: string | null) => {
  const [searchResultList, setSearchResultList] =
    useState<SpotifyApi.TrackSearchResponse | null>(null);

  //search user's input
  useEffect(() => {
    const fetchData = async () => {
      if (searchString && accessToken) {
        const data = await searchTracks(searchString, accessToken as string);
        setSearchResultList(data);
      } else {
        setSearchResultList(null);
      }
    };
    fetchData();
  }, [searchString, accessToken]);

  return { searchResultList };
};
