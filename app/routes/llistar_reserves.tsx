import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";

interface Reserva {
  id: number;
  clientName: string;
  date: string;
  status: string;
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

  const response = await fetch("http://localhost/api/reserves", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return json(
      { error: "Error en carregar les reserves" },
      { status: response.status }
    );
  }

  return json(await response.json());
}

export default function ReservesList() {
  const reserves = useLoaderData<Reserva[]>();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Gestió de Reserves
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-5xl mx-auto">
        {reserves.length === 0 ? (
          <p className="text-center text-gray-600">
            No hi ha reserves disponibles.
          </p>
        ) : (
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-black">
                <th className="p-3 text-left">Nom del Client</th>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Estat</th>
              </tr>
            </thead>
            <tbody>
              {reserves.map((reserva) => (
                <tr
                  key={reserva.id}
                  className="bg-gray-100 hover:bg-gray-200 transition"
                >
                  <td className="p-3 border text-black">
                    {reserva.clientName}
                  </td>
                  <td className="p-3 border text-black">{reserva.date}</td>
                  <td className="p-3 border text-black">{reserva.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
