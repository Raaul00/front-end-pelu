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
  const product_name = formData.get("product_name");
  const quantity = formData.get("quantity");

  try {
    const response = await fetch("http://localhost/api/inventories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_name, quantity }),
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

    return redirect("/inventari");
  } catch (error) {
    console.error("Error en la petició:", error);
    return json(
      { error: "Error en la comunicació amb el servidor" },
      { status: 500 }
    );
  }
}

export default function NewInventory() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Afegir Producte a l&apos;Inventari
        </h1>
        {actionData?.error && (
          <p className="text-red-500 text-sm mb-4">Error: {actionData.error}</p>
        )}
        <Form method="post" className="space-y-4">
          <input
            type="text"
            name="product_name"
            placeholder="Nom del Producte"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantitat"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Afegir Producte
          </button>
        </Form>
      </div>
    </div>
  );
}
