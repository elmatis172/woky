import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { ShippingMethodCard } from "@/components/admin/shipping-method-card";

export const metadata = {
  title: "Métodos de Envío",
};

export default async function ShippingMethodsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const shippingMethods = await db.shippingMethod.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Métodos de Envío</h1>
          <p className="text-muted-foreground mt-2">
            Configurá los métodos de envío disponibles para tus clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/setup-shipping.html"
            target="_blank"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Setup Inicial
          </Link>
          <Link
            href="/admin/envios/nuevo"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Método
          </Link>
        </div>
      </div>

      {shippingMethods.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No hay métodos de envío configurados
          </p>
          <Link
            href="/admin/envios/nuevo"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Método
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shippingMethods.map((method) => (
            <ShippingMethodCard key={method.id} method={method} />
          ))}
        </div>
      )}
    </div>
  );
}
