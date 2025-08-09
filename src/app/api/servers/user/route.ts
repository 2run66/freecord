import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all servers the user is a member of
    const servers = await db.server.findMany({
      where: {
        members: {
          some: {
            userId: profile.id
          }
        }
      },
      include: {
        channels: {
          where: {
            name: "general"
          }
        }
      }
    });

    return NextResponse.json(servers);
  } catch (error) {
    console.log("[USER_SERVERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}