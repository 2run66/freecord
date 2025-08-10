import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: NextRequest) {
  try {
    const me = await currentProfile();
    if (!me) return new NextResponse("Unauthorized", { status: 401 });

    const { toUserId } = await req.json();
    if (!toUserId || typeof toUserId !== "string") {
      return new NextResponse("toUserId is required", { status: 400 });
    }
    if (toUserId === me.id) {
      return new NextResponse("Cannot friend yourself", { status: 400 });
    }

    // If friendship already exists, no-op
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userAId: me.id, userBId: toUserId },
          { userAId: toUserId, userBId: me.id },
        ],
      },
    });
    if (existingFriendship) {
      return NextResponse.json({ ok: true, status: "already_friends" });
    }

    // If there is an incoming pending request from the target → accept it automatically
    const incoming = await db.friendRequest.findFirst({
      where: {
        fromUserId: toUserId,
        toUserId: me.id,
        status: "PENDING",
      },
    });
    if (incoming) {
      // Create friendship in stable order
      const [a, b] = [me.id, toUserId].sort();
      await db.friendship.create({ data: { userAId: a, userBId: b } });
      await db.friendRequest.update({
        where: { id: incoming.id },
        data: { status: "ACCEPTED" },
      });
      return NextResponse.json({ ok: true, status: "auto_accepted" });
    }

    // If I already sent a pending request, return ok
    const existingPending = await db.friendRequest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: me.id, toUserId } },
    });
    if (existingPending && existingPending.status === "PENDING") {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    // Create a new request
    const request = await db.friendRequest.upsert({
      where: { fromUserId_toUserId: { fromUserId: me.id, toUserId } },
      update: { status: "PENDING" },
      create: { fromUserId: me.id, toUserId },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.log("[FRIEND_REQUEST_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const me = await currentProfile();
    if (!me) return new NextResponse("Unauthorized", { status: 401 });

    const incoming = await db.friendRequest.findMany({
      where: { toUserId: me.id, status: "PENDING" },
      include: { fromUser: true },
      orderBy: { createdAt: "desc" },
    });
    const outgoing = await db.friendRequest.findMany({
      where: { fromUserId: me.id, status: "PENDING" },
      include: { toUser: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ incoming, outgoing });
  } catch (error) {
    console.log("[FRIEND_REQUEST_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


