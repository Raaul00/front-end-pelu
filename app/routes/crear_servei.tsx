import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { sessionStorage } from "../utils/session.server";

type ActionData = { error?: string };

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
  const name = formData.get("name");
  const price = formData.get("price");
  const duration = formData.get("duration");

  try {
    const response = await fetch("http://localhost/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, price, duration }),
    });

    const textResponse = await response.text();
    console.log("Resposta API:", textResponse);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(textResponse);
    } catch (e) {
      return json(
        { error: "Resposta del servidor no vàlida" },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return json(
        { error: jsonResponse.message || "Error desconegut" },
        { status: response.status }
      );
    }

    return redirect("/serveis");
  } catch (error) {
    console.error("Error en la petició:", error);
    return json(
      { error: "Error en la comunicació amb el servidor" },
      { status: 500 }
    );
  }
}

export default function NewService() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Crear Nou Servei
        </h1>
        {actionData?.error && (
          <p className="text-red-500 text-sm mb-4">Error: {actionData.error}</p>
        )}
        <Form method="post" className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nom del Servei"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="price"
            placeholder="Preu (€)"
            required
            step="0.01"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="duration"
            placeholder="Duració (minuts)"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Crear Servei
          </button>
        </Form>
      </div>
    </div>
  );
}
