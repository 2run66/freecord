import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is a member of this server
    const member = await db.serverMember.findFirst({
      where: {
        serverId: serverId,
        userId: profile.id,
      }
    });

    if (!member) {
      return new NextResponse("Not a member of this server", { status: 403 });
    }

    // Get all channels for this server
    const channels = await db.channel.findMany({
      where: {
        serverId: serverId,
      },
      orderBy: {
        createdAt: "asc",
      }
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.log("[SERVER_CHANNELS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}