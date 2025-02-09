import { useLoaderData, Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";
import { useState } from "react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
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

  const response = await fetch("http://localhost/api/clients", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return json(
      { error: "Error en carregar els clients" },
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
    await fetch(`http://localhost/api/clients/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    return json({ success: true });
  }

  if (actionType === "update" && id) {
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");

    await fetch(`http://localhost/api/clients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, phone }),
    });

    return json({ success: true });
  }

  return json({ error: "Acció no vàlida" }, { status: 400 });
}

export default function ClientsList() {
  const clients = useLoaderData<Client[]>();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Gestió de Clients
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-5xl mx-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-black">
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Telèfon</th>
              <th className="p-3 text-center">Accions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr
                key={client.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-200 transition`}
              >
                <td className="p-3 border text-black">{client.name}</td>
                <td className="p-3 border text-black">{client.email}</td>
                <td className="p-3 border text-black">
                  {client.phone || "No especificat"}
                </td>
                <td className="p-3 border flex justify-center space-x-3">
                  <button
                    onClick={() => handleEdit(client)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Editar
                  </button>
                  <Form method="post">
                    <input type="hidden" name="actionType" value="delete" />
                    <input type="hidden" name="id" value={client.id} />
                    <button
                      type="submit"
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      onClick={(e) => {
                        if (
                          !confirm("Segur que vols eliminar aquest client?")
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

      {showModal && selectedClient && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Editar Client
            </h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="actionType" value="update" />
              <input type="hidden" name="id" value={selectedClient.id} />
              <input
                type="text"
                name="name"
                defaultValue={selectedClient.name}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                name="email"
                defaultValue={selectedClient.email}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                name="phone"
                defaultValue={selectedClient.phone || ""}
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
                  //   onClick={() => setShowModal(false)}
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
