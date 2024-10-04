import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Error from "next/error";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest
): Promise<NextResponse<SpotifyApi.UsersTopTracksResponse | any>> {
  const session = await getServerSession(authConfig);

  try {
    const res = await fetch(
      `${process.env.SPOTIFY_BASE_URL}/me/top/tracks?time_range=long_term&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const topTrackList = await res.json();

    return NextResponse.json(topTrackList, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
