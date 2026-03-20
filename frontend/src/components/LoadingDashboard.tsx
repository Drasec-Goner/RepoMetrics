import Skeleton from "./ui/Skeleton";

const LoadingDashboard = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />

      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>

      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />

      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>

      <Skeleton className="h-40 w-full" />
    </div>
  );
};

export default LoadingDashboard;