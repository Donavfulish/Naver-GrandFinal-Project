import ViewSpacePage from "@/components/view-space-page"

export const metadata = {
  title: "My Space - AuraSpace",
  description: "Your personalized immersive digital environment.",
}

export default function Page({ params }: { params: {id: string}}) {
  return <ViewSpacePage spaceId={params.id} />
}
