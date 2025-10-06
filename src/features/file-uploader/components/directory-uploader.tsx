"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import JSZip from "jszip";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blobToBase64 } from "@/features/file-uploader/utils/blob-to-base64";
import { useTRPC } from "@/lib/trpc/client";

export const DirectoryUploader = ({ projectId }: { projectId: string }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [zipSizeMB, setZipSizeMB] = useState<number | null>(null);

  const [status, setStatus] = useState<
    "zipping" | "savingB64" | "uploading" | "failed" | "done" | null
  >(null);

  const inputRef = useRef<HTMLInputElement>(null);

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
    setZipSizeMB(null);
  };

  const uploadFiles = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select files first");
      return;
    }

    setStatus("zipping");

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

      const sizeInMB = zipBlob.size / (1024 * 1024);
      setZipSizeMB(sizeInMB);
      toast.info(`Pliki spakowane do zipa (${sizeInMB.toFixed(2)} MB)`);

      setStatus("savingB64");
      const base64Zip = await blobToBase64(zipBlob);

      setStatus("uploading");
      await upload({
        zipContent: base64Zip,
        projectId,
      });

      toast.success("Pliki wysłane!");
      setFiles(null);
      setZipSizeMB(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setStatus("done");
    } catch (error) {
      toast.error("Upload failed", {
        description: (error as Error).message,
      });
      setStatus("failed");
    }
  };

  const inProgress =
    status === "uploading" || status === "zipping" || status === "savingB64";

  return (
    <div className="grid w-full items-center gap-3">
      <Input
        ref={inputRef}
        id="files"
        type="file"
        // @ts-expect-error - directory picking (Chromium)
        webkitdirectory="true"
        multiple
        onChange={onSelect}
      />

      <div className="text-sm space-y-1">
        <div>
          <span>Status: {status ?? "idle"}</span>
        </div>
        {zipSizeMB !== null && (
          <div>
            <span>ZIP size: {zipSizeMB.toFixed(2)} MB</span>
          </div>
        )}
      </div>

      <Button
        onClick={uploadFiles}
        loading={inProgress}
        disabled={files === null || files.length === 0 || inProgress}
      >
        Wyślij
      </Button>
    </div>
  );
};
