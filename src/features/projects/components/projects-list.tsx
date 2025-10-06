"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTRPC } from "@/lib/trpc/client";

export const ProjectsList = () => {
  const trpc = useTRPC();
  const { data: projects } = useQuery(
    trpc.projects.listProjects.queryOptions(),
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold">Istniejące projekty</p>
      <div className="flex flex-col gap-4 max-w-md">
        {projects?.map((project) => (
          <Link
            href={`/project/${project.id}`}
            key={project.id}
            className="bg-secondary px-2 py-1 rounded-md hover:bg-secondary/70"
          >
            {project.name}
          </Link>
        ))}
      </div>
    </div>
  );
};
