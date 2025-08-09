import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { RoomServiceClient } from "livekit-server-sdk";

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

    // Check if user is already in this voice channel
    const existing = await db.voiceChannelParticipant.findUnique({
      where: {
        userId_channelId: {
          userId: profile.id,
          channelId: channelId
        }
      }
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Ensure LiveKit room exists
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (apiKey && apiSecret && wsUrl) {
      try {
        const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
        // Create room if it doesn't exist (this is idempotent)
        await roomService.createRoom({
          name: channelId,
          maxParticipants: 50, // Adjust as needed
        });
      } catch (liveKitError: any) {
        // If room already exists, that's fine - continue
        if (liveKitError.status !== 409) {
          console.log("[VOICE_CHANNEL_JOIN] LiveKit room creation failed:", liveKitError);
        }
      }
    }

    // Add user to voice channel
    const participant = await db.voiceChannelParticipant.create({
      data: {
        userId: profile.id,
        channelId: channelId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.log("[VOICE_CHANNEL_JOIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}