import { useEffect, useState } from "react";
import { Package, ArrowRightLeft, Briefcase, AlertTriangle } from "lucide-react";
import { supabase } from "../services/supabase";

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    assets: 0,
    movements: 0,
    pouches: 0,
    pending: 0,
  });

  const [recent, setRecent] = useState([]);

  async function loadDashboard() {
    const { count: assetsCount } = await supabase
      .from("assets")
      .select("*", { count: "exact", head: true });

    const { count: movementsCount } = await supabase
      .from("movements")
      .select("*", { count: "exact", head: true });

    const { count: pouchesCount } = await supabase
      .from("pouches")
      .select("*", { count: "exact", head: true });

    const { count: pendingCount } = await supabase
      .from("movements")
      .select("*", { count: "exact", head: true })
      .neq("status", "concluido");

    const { data: recentMovements } = await supabase
      .from("movements")
      .select("*, assets(name, patrimony), pouches(code)")
      .order("created_at", { ascending: false })
      .limit(5);

    setStats({
      assets: assetsCount || 0,
      movements: movementsCount || 0,
      pouches: pouchesCount || 0,
      pending: pendingCount || 0,
    });

    setRecent(recentMovements || []);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-slate-500 mt-1">
        Visão geral da logística interna de TI.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
        <StatCard title="Equipamentos" value={stats.assets} icon={Package} />
        <StatCard title="Movimentações" value={stats.movements} icon={ArrowRightLeft} />
        <StatCard title="Malotes" value={stats.pouches} icon={Briefcase} />
        <StatCard title="Pendências" value={stats.pending} icon={AlertTriangle} />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
        <h2 className="text-xl font-semibold mb-5">Atividades recentes</h2>

        {recent.length === 0 ? (
          <p className="text-slate-500">
            Nenhuma movimentação registrada ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {recent.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {movement.assets?.patrimony} - {movement.assets?.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {movement.origin} → {movement.destination}
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                    {movement.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {movement.type}
                    {movement.pouches?.code ? ` • ${movement.pouches.code}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}