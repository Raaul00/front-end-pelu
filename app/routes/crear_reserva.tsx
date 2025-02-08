import { Form, json, useActionData } from "@remix-run/react";
import { sessionStorage } from "../utils/session.server";

interface ActionData {
  error?: string;
  success?: string;
}

export const action = async ({ request }: { request: Request }) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    return json(
      { error: "No s'ha trobat el token d'autenticació." },
      { status: 401 }
    );
  }

  const formData = new URLSearchParams(await request.text());
  const clientId = formData.get("client_id");
  const serviceId = formData.get("service_id");
  const employeeId = formData.get("employee_id");
  const reservationTime = formData.get("reservation_time");

  if (!clientId || !serviceId || !employeeId || !reservationTime) {
    return json({ error: "Tots els camps són requerits." }, { status: 400 });
  }

  const res = await fetch("http://localhost/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      client_id: clientId,
      service_id: serviceId,
      employee_id: employeeId,
      reservation_time: reservationTime,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    return json(
      { error: data.message || "Error en crear la reserva." },
      { status: res.status }
    );
  }

  return json({ success: "Reserva creada correctament!" });
};

export default function CrearReserva() {
  const actionData = useActionData<ActionData>();

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
            <input
              type="text"
              id="client_id"
              name="client_id"
              required
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label htmlFor="service_id" className="block font-medium">
              Servei
            </label>
            <input
              type="text"
              id="service_id"
              name="service_id"
              required
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label htmlFor="employee_id" className="block font-medium">
              Empleat
            </label>
            <input
              type="text"
              id="employee_id"
              name="employee_id"
              required
              className="w-full border rounded p-2"
            />
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
