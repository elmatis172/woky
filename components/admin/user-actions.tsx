"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff } from "lucide-react";

interface UserActionsProps {
  userId: string;
  userName: string;
  isBlocked: boolean;
}

export function UserActions({ userId, userName, isBlocked }: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBlock = async () => {
    const action = isBlocked ? "desbloquear" : "bloquear";
    const confirmMessage = isBlocked
      ? `¿Estás seguro que querés desbloquear a "${userName}"? El usuario podrá acceder nuevamente.`
      : `¿Estás seguro que querés bloquear a "${userName}"? El usuario no podrá iniciar sesión.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blocked: !isBlocked }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el usuario");
      }

      router.refresh();
    } catch (error) {
      console.error(`Error al ${action} usuario:`, error);
      alert(`Error al ${action} el usuario. Por favor intentá de nuevo.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleBlock}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-colors ${
          isBlocked
            ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            : "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        } disabled:opacity-50`}
        title={isBlocked ? "Desbloquear usuario" : "Bloquear usuario"}
      >
        {isBlocked ? (
          <Shield className="h-5 w-5" />
        ) : (
          <ShieldOff className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
