import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { channelId } = await params;
    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    // Update lastSeen timestamp for this user in this voice channel
    const participant = await db.voiceChannelParticipant.updateMany({
      where: {
        userId: profile.id,
        channelId: channelId
      },
      data: {
        lastSeen: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[VOICE_CHANNEL_HEARTBEAT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}