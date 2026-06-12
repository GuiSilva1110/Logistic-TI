import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Pouches() {
  const [pouches, setPouches] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    code: "",
    origin: "",
    destination: "",
    status: "preparando",
  });

  async function loadData() {
    const { data: pouchesData, error: pouchesError } = await supabase
      .from("pouches")
      .select("*")
      .order("created_at", { ascending: false });

    if (pouchesError) {
      alert(pouchesError.message);
      return;
    }

    const { data: locationsData, error: locationsError } = await supabase
      .from("locations")
      .select("*")
      .order("name", { ascending: true });

    if (locationsError) {
      alert(locationsError.message);
      return;
    }

    setPouches(pouchesData || []);
    setLocations(locationsData || []);
  }

  async function createPouch(e) {
    e.preventDefault();

    if (!form.code || !form.origin || !form.destination) {
      alert("Informe código, origem e destino.");
      return;
    }

    const payload = {
      ...form,
      sent_at: form.status === "enviado" ? new Date().toISOString() : null,
      received_at: form.status === "recebido" ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("pouches").insert([payload]);

    if (error) {
      alert(error.message);
      return;
    }

    setForm({
      code: "",
      origin: "",
      destination: "",
      status: "preparando",
    });

    loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Malotes</h1>
      <p className="text-slate-500 mt-1">
        Controle dos malotes enviados entre matriz, setores e agências.
      </p>

      <form
        onSubmit={createPouch}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8"
      >
        <h2 className="text-xl font-semibold mb-5">Novo malote</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Código do malote * Ex: ML001"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <select
            className="border rounded-xl px-4 py-3"
            value={form.origin}
            onChange={(e) => setForm({ ...form, origin: e.target.value })}
          >
            <option value="">Origem</option>
            {locations.map((location) => (
              <option key={location.id} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded-xl px-4 py-3"
            value={form.destination}
            onChange={(e) =>
              setForm({ ...form, destination: e.target.value })
            }
          >
            <option value="">Destino</option>
            {locations.map((location) => (
              <option key={location.id} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded-xl px-4 py-3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="preparando">Preparando</option>
            <option value="enviado">Enviado</option>
            <option value="recebido">Recebido</option>
            <option value="concluido">Concluído</option>
            <option value="problema">Problema</option>
          </select>
        </div>

        <button className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
          Criar malote
        </button>
      </form>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
        <h2 className="text-xl font-semibold mb-5">Malotes cadastrados</h2>

        {pouches.length === 0 ? (
          <p className="text-slate-500">Nenhum malote criado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-slate-500 text-sm">
                  <th className="py-3">Código</th>
                  <th>Origem</th>
                  <th>Destino</th>
                  <th>Status</th>
                  <th>Criado em</th>
                </tr>
              </thead>

              <tbody>
                {pouches.map((pouch) => (
                  <tr key={pouch.id} className="border-b">
                    <td className="py-3 font-medium">{pouch.code}</td>
                    <td>{pouch.origin}</td>
                    <td>{pouch.destination}</td>
                    <td>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                        {pouch.status}
                      </span>
                    </td>
                    <td>
                      {new Date(pouch.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}