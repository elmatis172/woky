import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { WokyLogo } from "@/components/woky-logo";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Users,
  LogOut,
  DollarSign
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Verificar si el usuario está autenticado y es admin
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const menuItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/productos", icon: Package, label: "Productos" },
    { href: "/admin/categorias", icon: FolderTree, label: "Categorías" },
    { href: "/admin/ordenes", icon: ShoppingCart, label: "Órdenes" },
    { href: "/admin/finanzas", icon: DollarSign, label: "Finanzas" },
    { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="no-print w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-4 border-b dark:border-gray-700">
          <Link href="/admin" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                <WokyLogo /> <span>Kids</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Panel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {session.user.email}
            </p>
            <Link
              href="/api/auth/signout"
              className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 pb-24 min-h-screen">{children}</div>
      </main>
    </div>
  );
}
