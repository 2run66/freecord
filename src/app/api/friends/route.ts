import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  try {
    const me = await currentProfile();
    if (!me) return new NextResponse("Unauthorized", { status: 401 });

    const friendships = await db.friendship.findMany({
      where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
      include: { userA: true, userB: true },
      orderBy: { createdAt: "desc" },
    });

    const friends = friendships.map((f) => (f.userAId === me.id ? f.userB : f.userA));
    return NextResponse.json(friends);
  } catch (error) {
    console.log("[FRIENDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


