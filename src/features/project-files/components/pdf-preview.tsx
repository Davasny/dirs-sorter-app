export const PdfPreview = ({
                             fileId,
                             projectId,
                           }: {
  fileId: string;
  projectId: string;
}) => {
  // https://tinytip.co/tips/html-pdf-params/
  return (
    <iframe
      src={`/api/authorized/project/${projectId}/files/${fileId}#view=FitH&toolbar=1&navpanes=0`}
      className="h-full border-2"
      title="PDF"
    />
  );
};
