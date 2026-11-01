import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<SpotifyApi.PlaylistObjectSimplified[] | any>> {
  const session = await getServerSession(authConfig);

  const headers = {
    Authorization: `Bearer ${session?.access_token}`,
  };

  try {
    //get current user's id
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL}/me`,
      { headers }
    );
    const user: SpotifyApi.CurrentUsersProfileResponse = await userRes.json();

    //get all of the current user's playlists (50 per page)
    const items: SpotifyApi.PlaylistObjectSimplified[] = [];
    let nextUrl: string | null =
      `${process.env.NEXT_PUBLIC_SPOTIFY_API_BASE_URL}/me/playlists?limit=50`;

    while (nextUrl) {
      const playlistRes = await fetch(nextUrl, { headers });
      const playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse =
        await playlistRes.json();
      items.push(...playlists.items);
      nextUrl = playlists.next;
    }

    //only keep playlists created by the user that contain tracks
    const ownPlaylists = items.filter(
      (playlist) => playlist.owner.id === user.id && playlist.tracks.total > 0
    );

    return NextResponse.json(ownPlaylists, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
