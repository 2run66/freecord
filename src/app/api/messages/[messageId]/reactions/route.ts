import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const { emoji } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!emoji) {
      return new NextResponse("Emoji missing", { status: 400 });
    }

    // For now, we'll simulate reactions by returning success
    // In a real app, you'd store reactions in a separate table
    console.log(`User ${profile.id} reacted with ${emoji} to message ${messageId}`);

    return NextResponse.json({ 
      success: true,
      messageId,
      emoji,
      userId: profile.id
    });
  } catch (error) {
    console.log("[MESSAGE_REACTION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const { searchParams } = new URL(req.url);
    const emoji = searchParams.get("emoji");
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!emoji) {
      return new NextResponse("Emoji missing", { status: 400 });
    }

    // For now, we'll simulate reaction removal by returning success
    console.log(`User ${profile.id} removed reaction ${emoji} from message ${messageId}`);

    return NextResponse.json({ 
      success: true,
      messageId,
      emoji,
      userId: profile.id
    });
  } catch (error) {
    console.log("[MESSAGE_REACTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}