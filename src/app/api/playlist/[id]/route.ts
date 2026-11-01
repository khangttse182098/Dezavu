import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authConfig);

  try {
    const headers = {
      Authorization: `Bearer ${session?.access_token}`,
    };

    //get all of the playlist's tracks (100 per page)
    const playlistItems: SpotifyApi.PlaylistTrackObject[] = [];
    let nextUrl: string | null =
      `${process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL}/playlists/${params.id}/tracks?limit=100`;

    while (nextUrl) {
      const res = await fetch(nextUrl, { headers });
      const playlistTracks: SpotifyApi.PlaylistTrackResponse =
        await res.json();
      playlistItems.push(...playlistTracks.items);
      nextUrl = playlistTracks.next;
    }

    //only keep playable tracks (skip local files & episodes)
    const items = playlistItems
      .map((item) => item.track)
      .filter(
        (track): track is SpotifyApi.TrackObjectFull =>
          !!track && track.type === "track" && !track.is_local
      );

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
