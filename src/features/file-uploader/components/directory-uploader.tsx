"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import JSZip from "jszip";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { blobToBase64 } from "@/features/file-uploader/utils/blob-to-base64";
import { useTRPC } from "@/lib/trpc/client";

type IFileUploadStatus =
  | "idle"
  | "zipping"
  | "savingB64"
  | "uploading"
  | "failed"
  | "done";

const chunk = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

const BATCH_SIZE = 5;

export const DirectoryUploader = ({ projectId }: { projectId: string }) => {
  const [files, setFiles] = useState<FileList | null>(null);

  const [status, setStatus] = useState<IFileUploadStatus>("idle");
  const [progressPercent, setProgressPercent] = useState<number | null>(null);

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
  };

  const uploadFiles = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select files first");
      return;
    }

    setStatus("zipping");
    setProgressPercent(null);

    try {
      const fileArray = Array.from(files);
      const batches = chunk(fileArray, BATCH_SIZE);

      let totalUploaded = 0;
      let totalSizeMB = 0;

      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];

        setStatus("zipping");

        const zip = new JSZip();

        // add files to current batch zip
        for (let i = 0; i < batch.length; i++) {
          const file = batch[i];
          const path = file.webkitRelativePath || file.name;
          // await here to keep memory usage steadier
          zip.file(path, await file.arrayBuffer());
        }

        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });

        const sizeInMB = zipBlob.size / (1024 * 1024);
        totalSizeMB += sizeInMB;

        toast.info(
          `Paczka ${b + 1}/${batches.length} spakowana (${sizeInMB.toFixed(2)} MB)`,
        );

        setStatus("savingB64");
        const base64Zip = await blobToBase64(zipBlob);

        setStatus("uploading");
        await upload({
          zipContent: base64Zip,
          projectId,
        });

        totalUploaded += batch.length;
        setProgressPercent(Math.round((totalUploaded / files.length) * 100));

        toast.success(
          `Wysłano paczkę ${b + 1}/${batches.length} (${batch.length} plików, razem: ${totalUploaded}/${files.length})`,
        );
      }

      setStatus("done");
      toast.success(
        `Gotowe! Wysłano ${files.length} plików w ${batches.length} paczkach (~${totalSizeMB.toFixed(
          2,
        )} MB łącznie).`,
      );

      setFiles(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      let errorMessage = "Unknown error";
      if (error instanceof Error) errorMessage = error.message;

      console.error("Upload failed", error);
      toast.error("Upload failed", { description: errorMessage });

      setStatus("failed");
    }

    setProgressPercent(null);
  };

  const inProgress =
    status === "uploading" || status === "zipping" || status === "savingB64";

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (inProgress) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [inProgress]);

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

      <Button
        onClick={uploadFiles}
        loading={inProgress}
        disabled={files === null || files.length === 0 || inProgress}
      >
        Wyślij
      </Button>

      {progressPercent === null ? null : (
        <Progress value={progressPercent} className="w-full" />
      )}
    </div>
  );
};
