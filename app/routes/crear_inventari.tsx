import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { sessionStorage } from "../utils/session.server";

type ActionData = { error?: string };

// Loader per GET - Comprova si l'usuari ja està logat
export async function loader({ request }: { request: Request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    return redirect("/login"); // Si l'usuari no està logat, redirigeix-lo al login
  }

  return json({});
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
  const product_name = formData.get("product_name");
  const quantity = formData.get("quantity");

  if (!product_name || !quantity) {
    return json({ error: "Tots els camps són obligatoris" }, { status: 400 });
  }

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

    // 🔹 Afegit: Redirigir a la pàgina d'inventari després d'afegir un producte correctament
    return redirect("/inventari");
  } catch (error) {
    console.error("Error en la petició:", error);
    return json(
      { error: "Error en la comunicació amb el servidor" },
      { status: 500 }
    );
  }
}

export default function CrearInventari() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Perruqueria Cirvianum
      </h1>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Afegir Inventari
        </h2>
        {actionData?.error && (
          <p className="text-red-500 text-sm mb-4">Error: {actionData.error}</p>
        )}
        <Form method="post" className="space-y-4">
          <input
            type="text"
            name="product_name"
            placeholder="Nom del Producte"
            required
            className="w-full p-2 border border-gray-300 rounded bg-white text-black"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantitat"
            required
            className="w-full p-2 border border-gray-300 rounded bg-white text-black"
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
