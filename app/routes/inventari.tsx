import { Link, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";

export async function loader({ request }: { request: Request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (!token) {
    return redirect("/login");
  }

  return json({ authenticated: true });
}

export default function InventariRoute() {
  useLoaderData();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Inventari</h1>
        <p className="text-gray-600 mb-6">
          Aquí pots gestionar l&apos;inventari.
        </p>

        {/* Opcions per llistar o afegir inventari */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/mostrar_inventari"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Llistar Inventari
          </Link>
          <Link
            to="/crear_inventari"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Afegir Inventari
          </Link>
        </div>

        {/* Botó per tornar al Dashboard */}
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Tornar al Tauler
          </Link>
        </div>
      </div>
    </div>
  );
}
