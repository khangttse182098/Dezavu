import { TTrackList } from "@/app/home/types";
import { TSimpleTrack } from "@/shared/multiplayer";

//slim the Spotify track objects down to what the room server needs
export const simplifyTracks = (trackList: TTrackList | null): TSimpleTrack[] =>
  (trackList?.items ?? [])
    .filter((track) => !!track?.uri && !!track?.name)
    .map((track) => ({
      uri: track.uri,
      name: track.name,
      artist: track.artists[0]?.name ?? "Unknown artist",
      durationMs: track.duration_ms,
      image: track.album?.images?.[0]?.url ?? null,
    }));
