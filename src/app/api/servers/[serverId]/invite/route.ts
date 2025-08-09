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

    // Get server with invite code
    const server = await db.server.findFirst({
      where: {
        id: serverId,
      },
      select: {
        id: true,
        name: true,
        inviteCode: true,
      }
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_INVITE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin/moderator of this server
    const member = await db.serverMember.findFirst({
      where: {
        serverId: serverId,
        userId: profile.id,
        role: {
          in: ["ADMIN", "MODERATOR"]
        }
      }
    });

    if (!member) {
      return new NextResponse("Insufficient permissions", { status: 403 });
    }

    // Generate new invite code
    const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Update server with new invite code
    const server = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        inviteCode: newInviteCode,
      },
      select: {
        id: true,
        name: true,
        inviteCode: true,
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_INVITE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}