import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OkPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  if (!orderId) {
    redirect("/");
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/");
  }

  const session = await auth();

  return (
    <div className="container max-w-2xl py-16">
      <div className="rounded-2xl border bg-card p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold">¡Pago Exitoso!</h1>
        <p className="mb-8 text-muted-foreground">
          Tu pedido #{order.id.slice(0, 8)} ha sido confirmado
        </p>

        <div className="mb-8 rounded-lg bg-muted p-6 text-left">
          <h2 className="mb-4 font-semibold">Resumen del Pedido</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${(order.subtotal / 100).toFixed(2)}</span>
            </div>
            {order.shipping > 0 && (
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>${(order.shipping / 100).toFixed(2)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento:</span>
                <span>-${(order.discount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2" />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${(order.totalAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {order.status === "PAID"
              ? "Recibirás un email de confirmación en breve."
              : "Tu pago está siendo procesado. Te notificaremos cuando sea confirmado."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Volver al Inicio
            </Link>
            {session && (
              <a
                href="/pedidos"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent"
              >
                Ver Mis Pedidos
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
