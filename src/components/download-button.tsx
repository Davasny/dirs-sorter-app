"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner"; // or any toast lib
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/lib/trpc/client";

type Props = { projectId: string };

export function DownloadGroupButton({ projectId }: Props) {
  const trpc = useTRPC();
  const { data: files } = useQuery(
    trpc.projectFiles.listFiles.queryOptions({ projectId }),
  );

  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [abortCtrl, setAbortCtrl] = React.useState<AbortController | null>(
    null,
  );

  const startDownload = async () => {
    if (loading) return;
    const controller = new AbortController();
    setAbortCtrl(controller);
    setLoading(true);
    setProgress(null);

    try {
      const res = await fetch(`/api/grouped-files/${projectId}`, {
        method: "GET",
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      const condentDispositionHeader =
        res.headers.get("Content-Disposition") || "";
      let filename = `group-${projectId}.zip`;

      // Try the UTF-8 encoded form first: filename*=UTF-8''encoded-name.zip
      const utf8Match = condentDispositionHeader.match(
        /filename\*\s*=\s*UTF-8''([^;]+)/i,
      );
      if (utf8Match?.[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else {
        // Fallback to the plain filename="name.zip"
        const plainMatch = condentDispositionHeader.match(
          /filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;]+)/i,
        );

        if (plainMatch) {
          // DO NOT decodeURIComponent here — plain filenames are already literal text
          filename = (plainMatch[1] || plainMatch[2] || "").trim();
        }
      }

      const total = Number(res.headers.get("Content-Length") || 0);

      if (res.body && total > 0) {
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            setProgress(Math.round((received / total) * 100));
          }
        }

        // @ts-expect-error
        const blob = new Blob(chunks, {
          type: res.headers.get("Content-Type") || "application/octet-stream",
        });

        triggerDownload(blob, filename);
      } else {
        const blob = await res.blob();
        triggerDownload(blob, filename);
      }

      toast.success("Pobieranie rozpoczęte!");
    } catch (error) {
      if (controller.signal.aborted) {
        toast.message("Anulowano przygotowanie pliku.");
      } else {
        toast.error("Nie udało się pobrać pliku.");
        console.error(error);
      }
    } finally {
      setLoading(false);
      setProgress(null);
      setAbortCtrl(null);
    }
  };

  const cancel = () => abortCtrl?.abort();

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={startDownload}
        loading={loading}
        disabled={loading || files?.length === 0}
        aria-busy={loading}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            {progress === null
              ? "Przygotowywanie…"
              : `Pobieranie… ${progress}%`}
          </span>
        ) : (
          "Pobierz pliki"
        )}
      </Button>

      {loading && (
        <Button
          variant="ghost"
          size="icon"
          onClick={cancel}
          aria-label="Anuluj"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
