import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { sessionStorage } from "../utils/session.server";
import { LoaderFunction, ActionFunction } from "@remix-run/node";

// Definim els tipus correctes
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

interface LoaderData {
  clients: Client[];
  services: Service[];
  employees: Employee[];
}

// 🔹 Carreguem les dades abans de mostrar el formulari
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

  // 🔸 Obtenim les dades necessàries
  const [clientsRes, servicesRes, employeesRes] = await Promise.all([
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

  if (!clientsRes.ok || !servicesRes.ok || !employeesRes.ok) {
    throw new Response("Error carregant dades", { status: 500 });
  }

  const clients: Client[] = await clientsRes.json();
  const services: Service[] = await servicesRes.json();
  const employees: Employee[] = await employeesRes.json();

  return json<LoaderData>({ clients, services, employees });
};

// 🔹 Funció action per gestionar l'enviament del formulari
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const client_id = formData.get("client_id");
  const service_id = formData.get("service_id");
  const employee_id = formData.get("employee_id");
  const reservation_time = formData.get("reservation_time");

  if (!client_id || !service_id || !employee_id || !reservation_time) {
    return json({ error: "Tots els camps són obligatoris" }, { status: 400 });
  }

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    return redirect("/login");
  }

  const apiUrl = "http://localhost/api/reservations";
  const response = await fetch(apiUrl, {
    method: "POST",
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

  if (!response.ok) {
    return json({ error: "Error creant la reserva" }, { status: 500 });
  }

  return redirect("/reserves");
};

export default function CrearReserva() {
  const { clients, services, employees } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string; success?: string }>();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Crear Reserva
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg mx-auto">
        {actionData?.error && (
          <div className="text-red-500 text-center mb-4">
            {actionData.error}
          </div>
        )}
        {actionData?.success && (
          <div className="text-green-500 text-center mb-4">
            {actionData.success}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="client_id" className="block font-medium">
              Client
            </label>
            <select
              id="client_id"
              name="client_id"
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
              required
              className="w-full border rounded p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Crear Reserva
          </button>
        </Form>
      </div>
    </div>
  );
}
