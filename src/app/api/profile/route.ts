import { NextRequest, NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.log("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { displayName, imageUrl } = await req.json();
    const profile = await currentProfile();
    const { userId } = await auth();

    if (!profile || !userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the user in the database
    const updatedProfile = await db.user.update({
      where: {
        id: profile.id,
      },
      data: {
        name: displayName,
        avatar: imageUrl,
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.log("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}