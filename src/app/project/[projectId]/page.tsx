import { FilesGroupsList } from "@/features/files-groups/components/files-groups-list";
import { NewGroupForm } from "@/features/files-groups/components/new-group-form";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col w-full gap-8 h-full">
      <FilesGroupsList projectId={projectId} />

      <NewGroupForm projectId={projectId} />
    </div>
  );
}
