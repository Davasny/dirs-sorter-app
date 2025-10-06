"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { IProjectFile } from "@/features/project-files/db";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  hasGroup: boolean;
  fileId?: string;
  children?: FileNode[];
}

const buildFileTree = (files: IProjectFile[]): FileNode[] => {
  const root: FileNode[] = [];

  files.forEach((file) => {
    const parts = file.filePath.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const existingNode = currentLevel.find((node) => node.name === part);

      if (existingNode) {
        if (!isFile && existingNode.children) {
          currentLevel = existingNode.children;
        }
      } else {
        const newNode: FileNode = {
          name: part,
          type: isFile ? "file" : "folder",
          path: parts.slice(0, index + 1).join("/"),
          hasGroup: Boolean(file.groupId),
          ...(isFile && { fileId: file.id }),
          ...(!isFile && { children: [] }),
        };

        currentLevel.push(newNode);

        if (!isFile && newNode.children) {
          currentLevel = newNode.children;
        }
      }
    });
  });

  return root;
};

const COLOR_WITH_GROUP = "text-foreground/50";

const FileTreeNode = ({
  node,
  depth,
  projectId,
}: {
  node: FileNode;
  depth: number;
  projectId: string;
}) => {
  const [open, setOpen] = useState(true);
  const { fileId } = useParams<{ fileId: string }>();

  if (node.type === "file") {
    return (
      <Link
        href={`/project/${projectId}/file/${node.fileId}`}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40 transition-colors font-mono text-sm",
          node.hasGroup ? `font-normal ${COLOR_WITH_GROUP}` : "font-bold",
          fileId === node.fileId ? "bg-secondary font-bold" : "",
        )}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <File className="h-4 w-4 text-muted-foreground" />

        {node.name}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40 cursor-pointer select-none transition-colors w-full"
        style={{ marginLeft: `${depth * 16}px` }}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}

        <Folder
          className={cn(
            "h-4 w-4 text-[var(--color-ring)]",
            node.hasGroup ? COLOR_WITH_GROUP : "text-[var(--color-ring)]",
          )}
        />

        <span className={cn("text-sm", node.hasGroup ? COLOR_WITH_GROUP : "")}>
          {node.name}
        </span>
      </button>

      {open && node.children && node.children.length > 0 ? (
        <div
          className="border-l border-border pl-2"
          style={{ marginLeft: `${depth * 16 + 16}px` }}
        >
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={0}
              projectId={projectId}
            />
          ))}
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

  const fileTree = useMemo(() => {
    if (!files) return [];

    return buildFileTree(files);
  }, [files]);

  if (!files) return null;

  return (
    <div className="flex flex-col gap-0.5 text-sm font-mono whitespace-break-spaces break-all overflow-y-auto flex-1 min-h-0">
      {fileTree.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          projectId={projectId}
        />
      ))}
    </div>
  );
};
