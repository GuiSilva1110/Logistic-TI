import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Receipts() {
  const [movements, setMovements] = useState([]);
  const [receipts, setReceipts] = useState([]);

  const [form, setForm] = useState({
    movement_id: "",
    received_by: "",
    registration: "",
    notes: "",
  });

  async function loadData() {
    const { data: movementsData, error: movementsError } = await supabase
      .from("movements")
      .select("*, assets(id, name, patrimony), pouches(code)")
      .neq("status", "concluido")
      .order("created_at", { ascending: false });

    if (movementsError) {
      alert(movementsError.message);
      return;
    }

    const { data: receiptsData, error: receiptsError } = await supabase
      .from("receipts")
      .select("*, movements(destination, assets(name, patrimony))")
      .order("received_at", { ascending: false });

    if (receiptsError) {
      alert(receiptsError.message);
      return;
    }

    setMovements(movementsData || []);
    setReceipts(receiptsData || []);
  }

  async function createReceipt(e) {
    e.preventDefault();

    if (!form.movement_id || !form.received_by) {
      alert("Selecione a movimentação e informe quem recebeu.");
      return;
    }

    const movement = movements.find((item) => item.id === form.movement_id);

    const { error: receiptError } = await supabase
      .from("receipts")
      .insert([form]);

    if (receiptError) {
      alert(receiptError.message);
      return;
    }

    const { error: movementError } = await supabase
      .from("movements")
      .update({
        status: "concluido",
        responsible_receive: form.received_by,
        received_at: new Date().toISOString(),
      })
      .eq("id", form.movement_id);

    if (movementError) {
      alert(movementError.message);
      return;
    }

    if (movement?.asset_id) {
      const { error: assetError } = await supabase
        .from("assets")
        .update({
          status: "em_uso",
          current_location: movement.destination,
          assigned_to: form.received_by,
        })
        .eq("id", movement.asset_id);

      if (assetError) {
        alert(assetError.message);
        return;
      }
    }

    setForm({
      movement_id: "",
      received_by: "",
      registration: "",
      notes: "",
    });

    loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Recebimentos</h1>
      <p className="text-slate-500 mt-1">
        Confirmação de recebimento dos equipamentos enviados.
      </p>

      <form
        onSubmit={createReceipt}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8"
      >
        <h2 className="text-xl font-semibold mb-5">Confirmar recebimento</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="border rounded-xl px-4 py-3 md:col-span-2"
            value={form.movement_id}
            onChange={(e) =>
              setForm({ ...form, movement_id: e.target.value })
            }
          >
            <option value="">Selecione uma movimentação</option>

            {movements.map((movement) => (
              <option key={movement.id} value={movement.id}>
                {movement.assets?.patrimony} - {movement.assets?.name} |{" "}
                {movement.destination}
                {movement.pouches?.code ? ` | ${movement.pouches.code}` : ""}
              </option>
            ))}
          </select>

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Recebido por *"
            value={form.received_by}
            onChange={(e) =>
              setForm({ ...form, received_by: e.target.value })
            }
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Matrícula"
            value={form.registration}
            onChange={(e) =>
              setForm({ ...form, registration: e.target.value })
            }
          />

          <input
            className="border rounded-xl px-4 py-3 md:col-span-4"
            placeholder="Observações"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <button className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
          Confirmar recebimento
        </button>
      </form>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
        <h2 className="text-xl font-semibold mb-5">Recebimentos registrados</h2>

        {receipts.length === 0 ? (
          <p className="text-slate-500">
            Nenhum recebimento registrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-slate-500 text-sm">
                  <th className="py-3">Equipamento</th>
                  <th>Destino</th>
                  <th>Recebido por</th>
                  <th>Matrícula</th>
                  <th>Data</th>
                </tr>
              </thead>

              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b">
                    <td className="py-3 font-medium">
                      {receipt.movements?.assets?.patrimony} -{" "}
                      {receipt.movements?.assets?.name}
                    </td>
                    <td>{receipt.movements?.destination || "-"}</td>
                    <td>{receipt.received_by}</td>
                    <td>{receipt.registration || "-"}</td>
                    <td>
                      {new Date(receipt.received_at).toLocaleString("pt-BR")}
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