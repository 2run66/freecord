import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
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

    // Remove user from voice channel
    await db.voiceChannelParticipant.delete({
      where: {
        userId_channelId: {
          userId: profile.id,
          channelId: channelId
        }
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[VOICE_CHANNEL_LEAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}