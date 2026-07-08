import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", roles: ["admin", "internal_user", "portal_user"] },
  { label: "Products", path: "/products", roles: ["admin", "internal_user", "portal_user"] },
  { label: "Recurring Plans", path: "/plans", roles: ["admin", "internal_user", "portal_user"] },
  { label: "Subscriptions", path: "/subscriptions", roles: ["admin", "internal_user", "portal_user"] },
  { label: "Quotation Templates", path: "/quotation-templates", roles: ["admin", "internal_user"] },
  { label: "Invoices", path: "/invoices", roles: ["admin", "internal_user", "portal_user"] },
  { label: "Payments", path: "/payments", roles: ["admin", "internal_user", "portal_user"] },
  { label: "Discounts", path: "/discounts", roles: ["admin"] },
  { label: "Taxes", path: "/taxes", roles: ["admin"] },
  { label: "Users", path: "/users", roles: ["admin"] },
  { label: "Reports", path: "/reports", roles: ["admin", "internal_user"] },
];

const MainLayout = () => {
  const { user, logout } = useAuth();

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-lg font-bold text-white">SubManage</h1>
          <p className="text-xs text-slate-400 mt-1">Subscription Management</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">
                {user?.full_name || user?.email}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
