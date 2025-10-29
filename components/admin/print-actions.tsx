"use client";

import { useRouter } from "next/navigation";

export function PrintActions() {
  const router = useRouter();

  return (
    <div className="no-print mb-6 flex justify-between items-center">
      <button
        onClick={() => router.push('/admin/ordenes')}
        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        ← Volver
      </button>
      <button
        onClick={() => window.print()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        🖨️ Imprimir
      </button>
    </div>
  );
}
