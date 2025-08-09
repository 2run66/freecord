import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(
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

    // First, clean up stale participants (haven't been seen in 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    
    await db.voiceChannelParticipant.deleteMany({
      where: {
        channelId: channelId,
        lastSeen: {
          lt: thirtySecondsAgo
        }
      }
    });

    // Get all active participants in this voice channel
    const participants = await db.voiceChannelParticipant.findMany({
      where: {
        channelId: channelId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("[VOICE_CHANNEL_PARTICIPANTS] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}