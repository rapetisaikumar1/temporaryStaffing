export default function Loader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-10 w-10' };
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-[1.5px] border-ink-200 border-t-ink-900`}
      />
    </div>
  );
}
