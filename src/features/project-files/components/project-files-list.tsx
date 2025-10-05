"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

const FileRow = ({
  filePath,
  depth,
  fileId,
  projectId,
}: {
  filePath: string;
  depth: number;
  fileId: string;
  projectId: string;
}) => {
  const parts = filePath.split("/");
  const isFolder = parts.length > 1;
  const [open, setOpen] = useState(true);

  if (!isFolder) {
    // simple file
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40 transition-colors",
          depth > 0 && `ml-${depth * 4}`,
        )}
      >
        <File className="h-4 w-4 text-muted-foreground" />
        <Link
          href={`/project/${projectId}/file/${fileId}`}
          className="font-mono text-sm"
        >
          {filePath}
        </Link>
      </div>
    );
  }

  const folderName = parts[0];
  const remainingPath = parts.slice(1).join("/");

  return (
    <div className={cn(depth > 0 && `ml-${depth * 4}`)}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40 cursor-pointer select-none transition-colors w-full"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}

        <Folder className="h-4 w-4 text-[var(--color-ring)]" />
        <span className="font-semibold text-sm">{folderName}</span>
      </button>

      {open && remainingPath ? (
        <div className="border-l border-border ml-4 pl-2">
          <FileRow
            filePath={remainingPath}
            depth={depth + 1}
            fileId={fileId}
            projectId={projectId}
          />
        </div>
      ) : null}
    </div>
  );
};

export const ProjectFilesList = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC();
  const { data: files } = useQuery(
    trpc.projectFiles.listFiles.queryOptions({ projectId }),
  );

  return (
    <div className="flex flex-col gap-0.5 text-sm font-mono whitespace-break-spaces break-all">
      {files?.map((f) => (
        <FileRow
          key={f.id}
          filePath={f.filePath}
          fileId={f.id}
          depth={0}
          projectId={projectId}
        />
      ))}
    </div>
  );
};
