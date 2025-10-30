import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ShippingMethodForm } from "@/components/admin/shipping-method-form";

export default async function NewShippingMethodPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nuevo Método de Envío</h1>
        <p className="text-muted-foreground mt-2">
          Creá un nuevo método de envío para tu tienda
        </p>
      </div>

      <ShippingMethodForm />
    </div>
  );
}
