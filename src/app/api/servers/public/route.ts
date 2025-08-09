import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find public servers (for now, we'll return servers that aren't joined by the user)
    const servers = await db.server.findMany({
      where: {
        AND: [
          {
            members: {
              none: {
                userId: profile.id
              }
            }
          },
          search ? {
            OR: [
              {
                name: {
                  contains: search
                }
              }
            ]
          } : {}
        ]
      },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      },
      take: 10
    });

    const publicServers = servers.map(server => ({
      id: server.id,
      name: server.name,
      description: `A community server with ${server._count.members} members`,
      imageUrl: server.avatar,
      memberCount: server._count.members,
      isPublic: true,
      inviteCode: server.inviteCode
    }));

    return NextResponse.json(publicServers);
  } catch (error) {
    console.log("[SERVERS_PUBLIC]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}