import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Remove participants who haven't been seen in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    
    const deletedParticipants = await db.voiceChannelParticipant.deleteMany({
      where: {
        lastSeen: {
          lt: thirtySecondsAgo
        }
      }
    });

    console.log(`[VOICE_CLEANUP] Removed ${deletedParticipants.count} stale participants`);

    return NextResponse.json({ 
      success: true, 
      removedCount: deletedParticipants.count 
    });
  } catch (error) {
    console.log("[VOICE_CHANNEL_CLEANUP]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}