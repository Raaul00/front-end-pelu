import { Form, json, redirect, useLoaderData } from "@remix-run/react";
import { sessionStorage } from "../utils/session.server";
import { LoaderFunction, ActionFunction } from "@remix-run/node";

interface Reservation {
  id: number;
  client_name: string;
  service_name: string;
  employee_name: string;
  reservation_time: string;
}

interface LoaderData {
  reservations: Reservation[];
}

// 🔹 Carreguem totes les reserves
export const loader: LoaderFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    throw new Response("No s'ha trobat el token d'autenticació.", {
      status: 401,
    });
  }

  const res = await fetch("http://localhost/api/reservations", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Response("Error carregant les reserves", { status: 500 });
  }

  const reservations: Reservation[] = await res.json();
  return json<LoaderData>({ reservations });
};

// 🔹 Funció per modificar o eliminar reserves
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("action");
  const reservation_id = formData.get("reservation_id");
  const reservation_time = formData.get("reservation_time");

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    return redirect("/login");
  }

  if (actionType === "delete") {
    await fetch(`http://localhost/api/reservations/${reservation_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } else if (actionType === "update") {
    await fetch(`http://localhost/api/reservations/${reservation_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reservation_time }),
    });
  }
  return redirect("/reserves");
};

export default function LlistarReserves() {
  const { reservations } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Llistar Reserves
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-4xl mx-auto">
        {reservations.length === 0 ? (
          <p className="text-center text-gray-500">No hi ha reserves.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Client</th>
                <th className="border p-2">Servei</th>
                <th className="border p-2">Empleat</th>
                <th className="border p-2">Data i Hora</th>
                <th className="border p-2">Accions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="text-center">
                  <td className="border p-2">{reservation.client_name}</td>
                  <td className="border p-2">{reservation.service_name}</td>
                  <td className="border p-2">{reservation.employee_name}</td>
                  <td className="border p-2">{reservation.reservation_time}</td>
                  <td className="border p-2 space-x-2">
                    <Form method="post" className="inline">
                      <input
                        type="hidden"
                        name="reservation_id"
                        value={reservation.id}
                      />
                      <input
                        type="datetime-local"
                        name="reservation_time"
                        defaultValue={reservation.reservation_time}
                        className="border rounded p-1"
                      />
                      <button
                        type="submit"
                        name="action"
                        value="update"
                        className="bg-blue-500 text-white p-1 rounded"
                      >
                        Modificar
                      </button>
                    </Form>
                    <Form method="post" className="inline">
                      <input
                        type="hidden"
                        name="reservation_id"
                        value={reservation.id}
                      />
                      <button
                        type="submit"
                        name="action"
                        value="delete"
                        className="bg-red-500 text-white p-1 rounded"
                      >
                        Eliminar
                      </button>
                    </Form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
