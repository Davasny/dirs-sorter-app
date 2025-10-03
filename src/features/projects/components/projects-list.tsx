"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { NewProjectForm } from "@/features/projects/components/new-project-form";
import { useTRPC } from "@/lib/trpc/client";

export const ProjectsList = () => {
  const trpc = useTRPC();
  const { data: projects } = useQuery(
    trpc.projects.listProjects.queryOptions(),
  );

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="">
        <NewProjectForm />
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <p className="font-bold">Istniejące projekty</p>
        <div className="flex flex-col gap-2 pl-4">
          {projects?.map((project) => (
            <Link
              href={`/project/${project.id}`}
              key={project.id}
              className="hover:underline"
            >
              {project.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
