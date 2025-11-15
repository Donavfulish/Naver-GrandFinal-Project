import SpaceEditor from "@/components/space-editor"

export const metadata = {
  title: "Space Editor - AuraSpace",
  description: "Customize your digital space with backgrounds, music, and widgets.",
}

export default function EditorPage({ params }: { params: { id: string } }) {
  return <SpaceEditor spaceId={params.id} />
}
