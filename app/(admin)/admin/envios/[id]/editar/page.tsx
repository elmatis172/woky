import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShippingMethodForm } from "@/components/admin/shipping-method-form";

export default async function EditShippingMethodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const shippingMethod = await db.shippingMethod.findUnique({
    where: { id },
  });

  if (!shippingMethod) {
    redirect("/admin/envios");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Método de Envío</h1>
        <p className="text-muted-foreground mt-2">
          Modificá los detalles del método de envío
        </p>
      </div>

      <ShippingMethodForm shippingMethod={shippingMethod} />
    </div>
  );
}
