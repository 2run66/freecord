import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!username) {
      return new NextResponse("Username missing", { status: 400 });
    }

    // Find the target user
    const targetUser = await db.user.findFirst({
      where: {
        name: {
          contains: username
        }
      }
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (targetUser.id === profile.id) {
      return new NextResponse("Cannot message yourself", { status: 400 });
    }

    // For now, we'll return a simple conversation object
    // In a real app, you'd create a proper conversation/DM channel
    const conversation = {
      id: `dm-${profile.id}-${targetUser.id}`,
      type: "DM",
      user: targetUser,
      lastMessage: null,
      isOnline: false // You'd implement real online status
    };

    return NextResponse.json(conversation);
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // For now, return empty array
    // In a real app, you'd fetch actual conversations
    const conversations: any[] = [];

    return NextResponse.json(conversations);
  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}