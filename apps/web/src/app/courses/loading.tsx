import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesLoading() {
  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-4">
      <div className="hidden space-y-3 lg:block">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
      <div className="lg:col-span-3">
        <Skeleton className="mb-6 h-9 w-64" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
