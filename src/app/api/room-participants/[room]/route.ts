import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { currentProfile } from "@/lib/current-profile";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ room: string }> }
) {
  try {
    const { room } = await params;
    
    const profile = await currentProfile();
    
    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    // LiveKit runs in the same Docker network - accessible via container name
    const roomService = new RoomServiceClient("http://livekit:7880", apiKey, apiSecret);
    
    try {
      const participants = await roomService.listParticipants(room);

      // Transform to our format and handle BigInt serialization
      const participantList = participants.map(p => {
        let parsedMetadata: { name?: string; avatar?: string } = {};
        try {
          parsedMetadata = p.metadata ? JSON.parse(p.metadata) : {};
        } catch (e) {
          // If metadata parsing fails, use empty object
          parsedMetadata = {};
        }

        return {
          sid: p.sid,
          identity: p.identity,
          metadata: p.metadata,
          joinedAt: p.joinedAt ? Number(p.joinedAt) : Date.now(), // Convert BigInt to number
          name: parsedMetadata.name || p.identity,
          avatar: parsedMetadata.avatar || undefined
        };
      });

      return NextResponse.json({ participants: participantList });
    } catch (liveKitError: any) {
      // If room doesn't exist in LiveKit, return empty participants list
      if (liveKitError.status === 404 || liveKitError.code === 'not_found') {
        return NextResponse.json({ participants: [] });
      }
      // Re-throw other LiveKit errors
      throw liveKitError;
    }
  } catch (error) {
    console.log("[ROOM_PARTICIPANTS_GET]", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}