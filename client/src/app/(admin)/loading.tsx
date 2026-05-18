export default function AdminLoading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 border-b border-ink-100 bg-white flex items-center px-6 shrink-0 gap-4">
        <div className="h-4 w-32 rounded-lg bg-ink-100" />
        <div className="h-3 w-48 rounded-lg bg-ink-100" />
      </div>
      {/* Content skeleton */}
      <main className="flex-1 px-6 py-6 space-y-5">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-24 rounded-2xl bg-white border border-ink-100 shadow-sm" />
          ))}
        </div>
        <div className="h-[420px] rounded-2xl bg-white border border-ink-100 shadow-sm" />
      </main>
    </div>
  );
}
