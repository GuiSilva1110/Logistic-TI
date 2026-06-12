import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    patrimony: "",
    serial_number: "",
    name: "",
    model: "",
    category: "",
    status: "estoque",
    current_location: "",
    assigned_to: "",
  });

  const [editForm, setEditForm] = useState({
    status: "estoque",
    current_location: "",
    assigned_to: "",
  });

  async function loadAssets() {
    setLoading(true);

    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setAssets(data || []);
    }

    setLoading(false);
  }

  async function createAsset(e) {
    e.preventDefault();

    if (!form.patrimony || !form.name) {
      alert("Preencha pelo menos patrimônio e nome do equipamento.");
      return;
    }

    const { error } = await supabase.from("assets").insert([form]);

    if (error) {
      alert(error.message);
      return;
    }

    setForm({
      patrimony: "",
      serial_number: "",
      name: "",
      model: "",
      category: "",
      status: "estoque",
      current_location: "",
      assigned_to: "",
    });

    loadAssets();
  }

  function startEdit(asset) {
    setEditingId(asset.id);
    setEditForm({
      status: asset.status || "estoque",
      current_location: asset.current_location || "",
      assigned_to: asset.assigned_to || "",
    });
  }

  async function updateAsset(assetId) {
    const { error } = await supabase
      .from("assets")
      .update(editForm)
      .eq("id", assetId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingId(null);
    loadAssets();
  }

  async function disableAsset(assetId) {
  const confirmDisable = confirm(
    "Este equipamento será baixado, mas o histórico será mantido. Continuar?"
  );

  if (!confirmDisable) return;

  const { error } = await supabase
    .from("assets")
    .update({
      status: "baixado",
      assigned_to: "",
    })
    .eq("id", assetId);

  if (error) {
    alert(error.message);
    return;
  }

  loadAssets();
}
  useEffect(() => {
    loadAssets();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Equipamentos</h1>
      <p className="text-slate-500 mt-1">
        Controle de notebooks, monitores, celulares e demais ativos de TI.
      </p>

      <form
        onSubmit={createAsset}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8"
      >
        <h2 className="text-xl font-semibold mb-5">Novo equipamento</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Patrimônio *"
            value={form.patrimony}
            onChange={(e) => setForm({ ...form, patrimony: e.target.value })}
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Serial"
            value={form.serial_number}
            onChange={(e) =>
              setForm({ ...form, serial_number: e.target.value })
            }
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Nome * Ex: Notebook Dell"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Modelo"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />

          <select
            className="border rounded-xl px-4 py-3"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Categoria</option>
            <option value="notebook">Notebook</option>
            <option value="desktop">Desktop</option>
            <option value="monitor">Monitor</option>
            <option value="celular">Celular</option>
            <option value="impressora">Impressora</option>
            <option value="periferico">Periférico</option>
            <option value="outro">Outro</option>
          </select>

          <select
            className="border rounded-xl px-4 py-3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="estoque">Estoque</option>
            <option value="em_uso">Em uso</option>
            <option value="em_transito">Em trânsito</option>
            <option value="manutencao">Manutenção</option>
            <option value="baixado">Baixado</option>
          </select>

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Local atual"
            value={form.current_location}
            onChange={(e) =>
              setForm({ ...form, current_location: e.target.value })
            }
          />

          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Responsável atual"
            value={form.assigned_to}
            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
          />
        </div>

        <button className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
          Cadastrar equipamento
        </button>
      </form>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
        <h2 className="text-xl font-semibold mb-5">Equipamentos cadastrados</h2>

        {loading ? (
          <p className="text-slate-500">Carregando...</p>
        ) : assets.length === 0 ? (
          <p className="text-slate-500">Nenhum equipamento cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-slate-500 text-sm">
                  <th className="py-3">Patrimônio</th>
                  <th>Equipamento</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Local</th>
                  <th>Responsável</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-b">
                    <td className="py-3 font-medium">{asset.patrimony}</td>
                    <td>{asset.name}</td>
                    <td>{asset.category || "-"}</td>

                    {editingId === asset.id ? (
                      <>
                        <td>
                          <select
                            className="border rounded-lg px-3 py-2"
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="estoque">Estoque</option>
                            <option value="em_uso">Em uso</option>
                            <option value="em_transito">Em trânsito</option>
                            <option value="manutencao">Manutenção</option>
                            <option value="baixado">Baixado</option>
                          </select>
                        </td>

                        <td>
                          <input
                            className="border rounded-lg px-3 py-2"
                            value={editForm.current_location}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                current_location: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td>
                          <input
                            className="border rounded-lg px-3 py-2"
                            value={editForm.assigned_to}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                assigned_to: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td className="space-x-2">
                          <button
                            type="button"
                            onClick={() => updateAsset(asset.id)}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg"
                          >
                            Salvar
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="bg-slate-200 px-3 py-2 rounded-lg"
                          >
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                            {asset.status}
                          </span>
                        </td>
                        <td>{asset.current_location || "-"}</td>
                        <td>{asset.assigned_to || "-"}</td>
                        <td className="space-x-2">
                          <button
                            type="button"
                            onClick={() => startEdit(asset)}
                            className="bg-slate-900 text-white px-3 py-2 rounded-lg"
                          >
                            Editar
                          </button>

                          <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    disableAsset(asset.id);
  }}
  className="bg-red-600 text-white px-3 py-2 rounded-lg"
>
  Baixar
</button>
                        </td>
                      </>
                    )}
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