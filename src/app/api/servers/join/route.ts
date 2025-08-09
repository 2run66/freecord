import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { inviteCode } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!inviteCode) {
      return new NextResponse("Invite code missing", { status: 400 });
    }

    // Find server by invite code
    const existingServer = await db.server.findFirst({
      where: {
        inviteCode: inviteCode,
      },
      include: {
        members: {
          where: {
            userId: profile.id
          }
        }
      }
    });

    if (!existingServer) {
      return new NextResponse("Invalid invite code", { status: 404 });
    }

    // Check if user is already a member
    if (existingServer.members.length > 0) {
      return NextResponse.json(existingServer);
    }

    // Add user as member
    const server = await db.server.update({
      where: {
        id: existingServer.id,
      },
      data: {
        members: {
          create: [
            {
              userId: profile.id,
              role: "GUEST"
            }
          ]
        }
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVERS_JOIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}