export const ImagePreview = ({
  fileId,
  filePath,
                               projectId,
}: {
  fileId: string;
  filePath: string;
  projectId: string;
}) => {
  return (
    <img
      src={`/api/authorized/project/${projectId}/files/${fileId}`}
      alt={filePath}
      className="h-full object-contain border-1 p-2 rounded-md"
    />
  );
};
