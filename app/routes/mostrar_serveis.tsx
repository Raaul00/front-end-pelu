import { useLoaderData, Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";
import { useState } from "react";

interface Servei {
  id: number;
  name: string;
  description: string;
  price: number;
}

export async function loader({ request }: { request: Request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    return json(
      { error: "No s'ha trobat el token d'autenticació" },
      { status: 401 }
    );
  }

  const response = await fetch("http://localhost/api/serveis", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return json(
      { error: "Error en carregar els serveis" },
      { status: response.status }
    );
  }

  return json(await response.json());
}

export async function action({ request }: { request: Request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    return json(
      { error: "No s'ha trobat el token d'autenticació" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const id = formData.get("id");

  if (actionType === "delete" && id) {
    await fetch(`http://localhost/api/serveis/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    return json({ success: true });
  }

  if (actionType === "update" && id) {
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");

    await fetch(`http://localhost/api/serveis/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, price }),
    });

    return json({ success: true });
  }

  return json({ error: "Acció no vàlida" }, { status: 400 });
}

export default function ServeisList() {
  const serveis = useLoaderData<Servei[]>();
  const [selectedServei, setSelectedServei] = useState<Servei | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = (servei: Servei) => {
    setSelectedServei(servei);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Gestió de Serveis
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-5xl mx-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-600 text-black">
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Descripció</th>
              <th className="p-3 text-left">Preu</th>
              <th className="p-3 text-center">Accions</th>
            </tr>
          </thead>
          <tbody>
            {serveis.map((servei, index) => (
              <tr
                key={servei.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-200 transition`}
              >
                <td className="p-3 border text-black">{servei.name}</td>
                <td className="p-3 border text-black">{servei.description}</td>
                <td className="p-3 border text-black">{servei.price}€</td>
                <td className="p-3 border flex justify-center space-x-3">
                  <button
                    onClick={() => handleEdit(servei)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Editar
                  </button>
                  <Form method="post">
                    <input type="hidden" name="actionType" value="delete" />
                    <input type="hidden" name="id" value={servei.id} />
                    <button
                      type="submit"
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      onClick={(e) => {
                        if (
                          !confirm("Segur que vols eliminar aquest servei?")
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedServei && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Editar Servei
            </h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="actionType" value="update" />
              <input type="hidden" name="id" value={selectedServei.id} />
              <input
                type="text"
                name="name"
                defaultValue={selectedServei.name}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                name="description"
                defaultValue={selectedServei.description}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                name="price"
                defaultValue={selectedServei.price}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-800 text-black px-4 py-2 rounded-lg"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-black px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
