import { useLoaderData, Form } from "@remix-run/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";
import { useState, useTransition } from "react";

// Definim els tipus de dades
interface Client {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

interface Reservation {
  id: number;
  client_id: number;
  service_id: number;
  employee_id: number;
  reservation_time: string;
}

interface LoaderData {
  reservations: Reservation[];
  clients: Client[];
  services: Service[];
  employees: Employee[];
}

// 🔹 Carreguem les dades
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

  const [reservationsRes, clientsRes, servicesRes, employeesRes] =
    await Promise.all([
      fetch("http://localhost/api/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

  if (
    !reservationsRes.ok ||
    !clientsRes.ok ||
    !servicesRes.ok ||
    !employeesRes.ok
  ) {
    throw new Response("Error carregant dades", { status: 500 });
  }

  const reservations: Reservation[] = await reservationsRes.json();
  const clients: Client[] = await clientsRes.json();
  const services: Service[] = await servicesRes.json();
  const employees: Employee[] = await employeesRes.json();

  return json<LoaderData>({ reservations, clients, services, employees });
};

// 🔹 Funció action per gestionar l'enviament del formulari
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const id = formData.get("id");

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    return redirect("/login");
  }

  if (actionType === "delete" && id) {
    await fetch(`http://localhost/api/reservations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    return json({ success: true });
  }

  if (actionType === "update" && id) {
    const client_id = formData.get("client_id");
    const service_id = formData.get("service_id");
    const employee_id = formData.get("employee_id");
    const reservation_time = formData.get("reservation_time");

    await fetch(`http://localhost/api/reservations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        client_id,
        service_id,
        employee_id,
        reservation_time,
      }),
    });

    return json({ success: true });
  }

  return json({ error: "Acció no vàlida" }, { status: 400 });
};

export default function LlistarReserves() {
  const { reservations, clients, services, employees } =
    useLoaderData<LoaderData>();
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  useTransition();

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const getClientName = (id: number) =>
    clients.find((client) => client.id === id)?.name || "Desconegut";
  const getServiceName = (id: number) =>
    services.find((service) => service.id === id)?.name || "Desconegut";
  const getEmployeeName = (id: number) =>
    employees.find((employee) => employee.id === id)?.name || "Desconegut";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Llista de Reserves
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-4xl mx-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-black">
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Servei</th>
              <th className="p-3 text-left">Empleat</th>
              <th className="p-3 text-left">Data i Hora</th>
              <th className="p-3 text-center">Accions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border">
                <td className="p-3 border text-black">
                  {getClientName(reservation.client_id)}
                </td>
                <td className="p-3 border text-black">
                  {getServiceName(reservation.service_id)}
                </td>
                <td className="p-3 border text-black">
                  {getEmployeeName(reservation.employee_id)}
                </td>
                <td className="p-3 border text-black">
                  {new Date(reservation.reservation_time).toLocaleString()}
                </td>
                <td className="p-3 border flex justify-center space-x-3">
                  <button
                    onClick={() => handleEdit(reservation)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Editar
                  </button>
                  <Form method="post">
                    <input type="hidden" name="actionType" value="delete" />
                    <input type="hidden" name="id" value={reservation.id} />
                    <button
                      type="submit"
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      onClick={(e) => {
                        if (
                          !confirm("Segur que vols eliminar aquesta reserva?")
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

      {showModal && selectedReservation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Editar Reserva
            </h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="actionType" value="update" />
              <input type="hidden" name="id" value={selectedReservation.id} />
              <div>
                <label htmlFor="client_id" className="block font-medium">
                  Client
                </label>
                <select
                  id="client_id"
                  name="client_id"
                  defaultValue={selectedReservation.client_id}
                  required
                  className="w-full border rounded p-2"
                >
                  <option value="">Selecciona un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="service_id" className="block font-medium">
                  Servei
                </label>
                <select
                  id="service_id"
                  name="service_id"
                  defaultValue={selectedReservation.service_id}
                  required
                  className="w-full border rounded p-2"
                >
                  <option value="">Selecciona un servei</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="employee_id" className="block font-medium">
                  Empleat
                </label>
                <select
                  id="employee_id"
                  name="employee_id"
                  defaultValue={selectedReservation.employee_id}
                  required
                  className="w-full border rounded p-2"
                >
                  <option value="">Selecciona un empleat</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="reservation_time" className="block font-medium">
                  Data i Hora de la Reserva
                </label>
                <input
                  type="datetime-local"
                  id="reservation_time"
                  name="reservation_time"
                  defaultValue={new Date(selectedReservation.reservation_time)
                    .toISOString()
                    .slice(0, 16)}
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
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
