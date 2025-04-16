import { getContainerLogs } from "@/lib/docker";
import { tryCatch } from "@/lib/tryCatch";

export default async function ContainerLogs({ id }: { id: string }) {
  const logs = await tryCatch(getContainerLogs(id));

  if (logs.error) return <p className="text-red-500">{logs.error.message}</p>;
  return (
    <pre className="text-xs whitespace-pre-wrap break-words">{logs.data}</pre>
  );
}
