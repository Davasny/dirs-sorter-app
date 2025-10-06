import { DownloadGroupButton } from "@/components/download-button";
import { Separator } from "@/components/ui/separator";
import { RemoveProjectDialog } from "@/features/project-settings/components/remove-project-dialog";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col w-full h-full gap-8">
      <div className="flex justify-end w-full">
        <DownloadGroupButton projectId={projectId} />
      </div>

      <Separator />

      <div className="flex justify-end w-full">
        <RemoveProjectDialog projectId={projectId} />
      </div>
    </div>
  );
}
