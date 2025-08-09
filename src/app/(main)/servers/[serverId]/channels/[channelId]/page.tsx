import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ChannelPageClient from "./channel-client";

interface ChannelIdPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { serverId, channelId } = await params;
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
  });

  const member = await db.serverMember.findFirst({
    where: {
      serverId: serverId,
      userId: profile.id,
    }
  });

  if (!channel || !member) {
    redirect("/");
  }

  return (
    <ChannelPageClient 
      channel={channel}
      profile={profile}
      serverId={serverId}
    />
  );
}

export default ChannelIdPage;