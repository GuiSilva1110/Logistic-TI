import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Locations() {
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    name: "",
    type: "agencia",
    city: "",
  });

  async function loadLocations() {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setLocations(data || []);
  }

  async function createLocation(e) {
    e.preventDefault();

    if (!form.name) {
      alert("Informe o nome da agência ou setor.");
      return;
    }

    const { error } = await supabase.from("locations").insert([form]);

    if (error) {
      alert(error.message);
      return;
    }

    setForm({
      name: "",
      type: "agencia",
      city: "",
    });

    loadLocations();
  }

  useEffect(() => {
    loadLocations();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Agências e Setores</h1>
      <p className="text-slate-500 mt-1">
        Cadastre os locais usados como origem e destino nas movimentações.
      </p>

      <form
        onSubmit={createLocation}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8"
      >
        <h2 className="text-xl font-semibold mb-5">Novo local</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Nome * Ex: Agência Centro"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            className="border rounded-xl px-4 py-3"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="agencia">Agência</option>
            <option value="setor">Setor interno</option>
            <option value="matriz">Matriz</option>
            <option value="outro">Outro</option>
          </select>

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>

        <button className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
          Cadastrar local
        </button>
      </form>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
        <h2 className="text-xl font-semibold mb-5">Locais cadastrados</h2>

        {locations.length === 0 ? (
          <p className="text-slate-500">Nenhum local cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-slate-500 text-sm">
                  <th className="py-3">Nome</th>
                  <th>Tipo</th>
                  <th>Cidade</th>
                </tr>
              </thead>

              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} className="border-b">
                    <td className="py-3 font-medium">{location.name}</td>
                    <td>{location.type}</td>
                    <td>{location.city || "-"}</td>
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