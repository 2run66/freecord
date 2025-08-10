import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

interface Params {
  params: { requestId: string };
}

export async function POST(_: Request, { params }: Params) {
  try {
    const me = await currentProfile();
    if (!me) return new NextResponse("Unauthorized", { status: 401 });

    const request = await db.friendRequest.findUnique({ where: { id: params.requestId } });
    if (!request || request.toUserId !== me.id || request.status !== "PENDING") {
      return new NextResponse("Not Found", { status: 404 });
    }

    await db.friendRequest.update({ where: { id: request.id }, data: { status: "DECLINED" } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("[FRIEND_REQUEST_DECLINE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


