export function WokyLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight ${className}`}>
      <span className="text-blue-500">W</span>
      <span className="text-red-500">O</span>
      <span className="text-yellow-500">K</span>
      <span className="text-green-400">Y</span>
    </span>
  );
}
