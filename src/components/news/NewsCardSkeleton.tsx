import { Skeleton } from "@/components/ui/skeleton";

export const NewsCardSkeleton = () => {
  return (
    <article className="bg-card border border-divider rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-4" />

      {/* Summary */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-4" />

      {/* Source */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Related Links */}
      <div className="pt-4 border-t border-divider">
        <Skeleton className="h-3 w-48" />
      </div>
    </article>
  );
};

export default NewsCardSkeleton;
