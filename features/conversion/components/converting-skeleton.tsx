import { Skeleton } from "@/components/ui/skeleton"

export function ConvertingSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-6" aria-hidden>
      <div className="flex flex-col gap-3 border-b pb-4">
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
