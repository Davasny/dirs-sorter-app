export const ImagePreview = ({
  fileId,
  filePath,
}: {
  fileId: string;
  filePath: string;
}) => {
  return (
    <img
      src={`/api/files/${fileId}`}
      alt={filePath}
      className="h-full object-contain border-1 p-2"
    />
  );
};
