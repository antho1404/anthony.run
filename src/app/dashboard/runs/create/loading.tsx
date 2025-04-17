import { Skeleton } from "@/components/ui/skeleton";

export default function RunFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-20" />
        <div className="flex w-full gap-2 items-end">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
