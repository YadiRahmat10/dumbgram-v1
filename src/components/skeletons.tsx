const box = "animate-pulse rounded bg-surface";

export function FeedSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[470px] space-y-8 px-3 pt-4 md:px-0 md:pt-8">
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`${box} h-8 w-8 rounded-full`} />
            <div className={`${box} h-3 w-32`} />
          </div>
          <div className={`${box} aspect-square w-full rounded-md`} />
          <div className={`${box} h-3 w-24`} />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-0.5 md:gap-1">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${box} aspect-square rounded-none`} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className={`${box} h-11 w-11 rounded-full`} />
          <div className="flex-1 space-y-2">
            <div className={`${box} h-3 w-32`} />
            <div className={`${box} h-3 w-20`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[935px] md:px-5 md:pt-8">
      <div className="flex items-center gap-6 px-4 pb-8 pt-5 md:gap-20 md:px-12">
        <div className={`${box} h-20 w-20 rounded-full md:h-[150px] md:w-[150px]`} />
        <div className="flex-1 space-y-4">
          <div className={`${box} h-5 w-40`} />
          <div className={`${box} h-4 w-64 max-w-full`} />
          <div className={`${box} h-4 w-48 max-w-full`} />
        </div>
      </div>
      <div className="border-t border-border pt-12">
        <GridSkeleton count={9} />
      </div>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="mx-auto grid max-w-[935px] md:grid-cols-[minmax(0,1fr)_380px] md:px-4 md:py-8">
      <div className={`${box} aspect-square rounded-none`} />
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <div className={`${box} h-8 w-8 rounded-full`} />
          <div className={`${box} h-3 w-28`} />
        </div>
        <div className={`${box} h-3 w-full`} />
        <div className={`${box} h-3 w-2/3`} />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className={`${box} h-20 w-full rounded-2xl`} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className={`${box} h-4 w-24`} />
          <div className={`${box} h-10 w-full`} />
        </div>
      ))}
    </div>
  );
}
