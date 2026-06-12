import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Briefcase,
  CheckCircle,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import { MapPin } from "lucide-react";
import Locations from "./pages/Locations";
import Assets from "./pages/Assets";
import Movements from "./pages/Movements";
import Pouches from "./pages/Pouches";
import Receipts from "./pages/Receipts";

function Sidebar() {
  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/equipamentos", label: "Equipamentos", icon: Package },
    { to: "/movimentacoes", label: "Movimentações", icon: ArrowRightLeft },
    { to: "/malotes", label: "Malotes", icon: Briefcase },
    { to: "/recebimentos", label: "Recebimentos", icon: CheckCircle },
    { to: "/locais", label: "Agências/Setores", icon: MapPin },
  ];

  return (
    <aside className="w-72 min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-1">TaskScore</h1>
      <p className="text-sm text-slate-400 mb-8">Logística Interna TI</p>

      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipamentos" element={<Assets />} />
            <Route path="/movimentacoes" element={<Movements />} />
            <Route path="/malotes" element={<Pouches />} />
            <Route path="/recebimentos" element={<Receipts />} />
            <Route path="/locais" element={<Locations />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}