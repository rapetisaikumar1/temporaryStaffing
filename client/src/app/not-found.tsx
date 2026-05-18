import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-6 text-7xl font-bold text-slate-200 select-none">404</div>
      <h1 className="text-xl font-semibold text-slate-800 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
