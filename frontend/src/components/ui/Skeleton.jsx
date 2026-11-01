// Loading placeholder: <Skeleton className="h-4 w-24" />
export default function Skeleton({ className = '', style }) {
  return <div aria-hidden="true" style={style} className={`animate-pulse rounded-lg bg-border/70 ${className}`} />;
}
