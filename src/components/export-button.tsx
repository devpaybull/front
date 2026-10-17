import { useMutation } from "@tanstack/react-query";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg?react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { saveFile } from "@/lib/save-file";

export function ExportButton({
  load,
  fileName,
}: {
  load: () => Promise<Blob>;
  fileName: string;
}) {
  const exporting = useMutation({
    mutationFn: load,
    onSuccess: (file) => saveFile(file, fileName),
  });

  return (
    <Button
      variant="secondary"
      className="gap-[7px] rounded-[14px] border-border px-6"
      disabled={exporting.isPending}
      title={exporting.isError ? errorMessage(exporting.error) : undefined}
      onClick={() => exporting.mutate()}
    >
      <ArrowUpIcon className="size-5" />
      {exporting.isError ? "Повторить выгрузку" : "Выгрузить"}
    </Button>
  );
}
