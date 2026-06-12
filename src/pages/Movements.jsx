import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Movements() {
  const [assets, setAssets] = useState([]);
  const [pouches, setPouches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [movements, setMovements] = useState([]);

  const [form, setForm] = useState({
    asset_id: "",
    pouch_id: "",
    type: "malote",
    origin: "",
    destination: "",
    requester: "",
    responsible_send: "",
    status: "solicitado",
    notes: "",
  });

  async function loadData() {
    const { data: assetsData } = await supabase
      .from("assets")
      .select("*")
      .neq("status", "baixado")
      .order("created_at", { ascending: false });

    const { data: pouchesData } = await supabase
      .from("pouches")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: locationsData } = await supabase
      .from("locations")
      .select("*")
      .order("name", { ascending: true });

    const { data: movementsData, error } = await supabase
      .from("movements")
      .select("*, assets(name, patrimony), pouches(code)")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setAssets(assetsData || []);
    setPouches(pouchesData || []);
    setLocations(locationsData || []);
    setMovements(movementsData || []);
  }

  async function createMovement(e) {
    e.preventDefault();

    if (!form.asset_id || !form.origin || !form.destination) {
      alert("Selecione equipamento, origem e destino.");
      return;
    }

    const payload = {
      ...form,
      pouch_id: form.type === "malote" && form.pouch_id ? form.pouch_id : null,
      sent_at: form.status === "enviado" ? new Date().toISOString() : null,
      received_at: form.status === "recebido" ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("movements").insert([payload]);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase
      .from("assets")
      .update({
        status: "em_transito",
        current_location: form.destination,
      })
      .eq("id", form.asset_id);

    setForm({
      asset_id: "",
      pouch_id: "",
      type: "malote",
      origin: "",
      destination: "",
      requester: "",
      responsible_send: "",
      status: "solicitado",
      notes: "",
    });

    loadData();
  }

  async function updateMovementStatus(movement, newStatus) {
    const payload = {
      status: newStatus,
      sent_at:
        newStatus === "enviado" ? new Date().toISOString() : movement.sent_at,
      received_at:
        newStatus === "recebido" || newStatus === "concluido"
          ? new Date().toISOString()
          : movement.received_at,
    };

    const { error } = await supabase
      .from("movements")
      .update(payload)
      .eq("id", movement.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Movimentações</h1>
      <p className="text-slate-500 mt-1">
        Controle de envios por malote ou motoboy.
      </p>

      <form
        onSubmit={createMovement}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8"
      >
        <h2 className="text-xl font-semibold mb-5">Nova movimentação</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="border rounded-xl px-4 py-3"
            value={form.asset_id}
            onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
          >
            <option value="">Selecione o equipamento</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.patrimony} - {asset.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded-xl px-4 py-3"
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
                pouch_id: e.target.value === "motoboy" ? "" : form.pouch_id,
              })
            }
          >
            <option value="malote">Malote</option>
            <option value="motoboy">Motoboy</option>
          </select>

          {form.type === "malote" && (
            <select
              className="border rounded-xl px-4 py-3"
              value={form.pouch_id}
              onChange={(e) => setForm({ ...form, pouch_id: e.target.value })}
            >
              <option value="">Selecionar malote</option>
              {pouches.map((pouch) => (
                <option key={pouch.id} value={pouch.id}>
                  {pouch.code} - {pouch.destination}
                </option>
              ))}
            </select>
          )}

          <select
            className="border rounded-xl px-4 py-3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="solicitado">Solicitado</option>
            <option value="preparando">Preparando</option>
            <option value="enviado">Enviado</option>
            <option value="recebido">Recebido</option>
            <option value="concluido">Concluído</option>
          </select>

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

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Solicitante"
            value={form.requester}
            onChange={(e) => setForm({ ...form, requester: e.target.value })}
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Responsável pelo envio"
            value={form.responsible_send}
            onChange={(e) =>
              setForm({ ...form, responsible_send: e.target.value })
            }
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Observações"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <button className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
          Registrar movimentação
        </button>
      </form>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
        <h2 className="text-xl font-semibold mb-5">
          Movimentações registradas
        </h2>

        {movements.length === 0 ? (
          <p className="text-slate-500">
            Nenhuma movimentação registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-slate-500 text-sm">
                  <th className="py-3">Equipamento</th>
                  <th>Tipo</th>
                  <th>Malote</th>
                  <th>Origem</th>
                  <th>Destino</th>
                  <th>Status</th>
                  <th>Solicitante</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b">
                    <td className="py-3 font-medium">
                      {movement.assets?.patrimony} - {movement.assets?.name}
                    </td>
                    <td className="capitalize">{movement.type}</td>
                    <td>{movement.pouches?.code || "-"}</td>
                    <td>{movement.origin}</td>
                    <td>{movement.destination}</td>
                    <td>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                        {movement.status}
                      </span>
                    </td>
                    <td>{movement.requester || "-"}</td>
                    <td>
                      <select
                        className="border rounded-lg px-3 py-2"
                        value={movement.status}
                        onChange={(e) =>
                          updateMovementStatus(movement, e.target.value)
                        }
                      >
                        <option value="solicitado">Solicitado</option>
                        <option value="preparando">Preparando</option>
                        <option value="enviado">Enviado</option>
                        <option value="recebido">Recebido</option>
                        <option value="concluido">Concluído</option>
                      </select>
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