import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

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

    const members = await db.serverMember.findMany({
      where: {
        serverId: serverId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        },
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "asc" }
      ]
    });

    return NextResponse.json(members);
  } catch (error) {
    console.log("[MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const { memberId, role } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if current user is admin
    const currentMember = await db.serverMember.findFirst({
      where: {
        serverId: serverId,
        userId: profile.id,
        role: "ADMIN"
      }
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update member role
    const updatedMember = await db.serverMember.update({
      where: {
        id: memberId,
        serverId: serverId,
      },
      data: {
        role: role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.log("[MEMBER_ROLE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const { memberId } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if current user is admin
    const currentMember = await db.serverMember.findFirst({
      where: {
        serverId: serverId,
        userId: profile.id,
        role: "ADMIN"
      }
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Don't allow kicking admins
    const targetMember = await db.serverMember.findFirst({
      where: {
        id: memberId,
        serverId: serverId,
      }
    });

    if (targetMember?.role === "ADMIN") {
      return new NextResponse("Cannot kick admin", { status: 400 });
    }

    // Remove member from server
    await db.serverMember.delete({
      where: {
        id: memberId,
        serverId: serverId,
      }
    });

    return new NextResponse("Member removed", { status: 200 });
  } catch (error) {
    console.log("[MEMBER_KICK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}