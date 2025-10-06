import { useQuery } from "@tanstack/react-query";

export const RawPreview = ({ fileId }: { fileId: string }) => {
  const { data: fileContent } = useQuery({
    queryKey: ["fileContent", fileId],
    queryFn: async () => {
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) throw new Error("Failed to fetch file");
      return await response.text();
    },
  });

  return (
    <pre className="text-sm font-mono whitespace-pre-wrap break-words border-1 p-2 rounded-md">
      {fileContent}
    </pre>
  );
};
