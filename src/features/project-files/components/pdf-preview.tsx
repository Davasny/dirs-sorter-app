export const PdfPreview = ({ fileId }: { fileId: string }) => {
  return (
    <iframe
      src={`/api/files/${fileId}#view=FitH&toolbar=1&navpanes=0`}
      className="h-full aspect-[210/297] border-2"
      title="PDF"
    />
  );
};
