"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import JSZip from "jszip";
import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blobToBase64 } from "@/features/file-uploader/utils/blob-to-base64";
import { useTRPC } from "@/lib/trpc/client";

export const DirectoryUploader = ({ projectId }: { projectId: string }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutateAsync: upload } = useMutation(
    trpc.fileUpload.upload.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(
          trpc.projectFiles.listFiles.queryFilter({ projectId }),
        ),
    }),
  );

  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const zipFiles = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select files first");
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = file.webkitRelativePath || file.name;
        zip.file(path, await file.arrayBuffer());
      }

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const base64Zip = await blobToBase64(zipBlob);
      await upload({
        zipContent: base64Zip,
        projectId,
      });

      toast.success("Uploaded!");
      setFiles(null);
    } catch (error) {
      toast.error("Upload failed", {
        description: (error as Error).message,
      });
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="grid w-full items-center gap-3">
      <Label htmlFor="files">Folder or files</Label>
      <Input
        id="files"
        type="file"
        // @ts-expect-error - directory picking (Chromium)
        webkitdirectory="true"
        multiple
        onChange={onSelect}
      />

      <Button onClick={zipFiles} loading={isZipping} disabled={files === null || files.length === 0}>
        Upload
      </Button>
    </div>
  );
};
