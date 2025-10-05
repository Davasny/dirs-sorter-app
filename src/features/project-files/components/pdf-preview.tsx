export const PdfPreview = ({ fileId }: { fileId: string }) => {
  // https://tinytip.co/tips/html-pdf-params/
  return (
    <iframe
      src={`/api/files/${fileId}#view=FitH&toolbar=1&navpanes=0`}
      className="h-full border-2"
      title="PDF"
    />
  );
};
