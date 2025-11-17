import ViewSpacePage from "@/components/view-space-page"
import * as React from 'react'

export const metadata = {
    title: "My Space - AuraSpace",
    description: "Your personalized immersive digital environment.",
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ViewSpacePage spaceId={id} />
}