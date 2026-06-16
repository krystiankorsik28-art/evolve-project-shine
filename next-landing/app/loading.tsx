export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 animate-pulse" />
        <div className="text-xs text-white/30">Loading EduNex...</div>
      </div>
    </div>
  );
}
