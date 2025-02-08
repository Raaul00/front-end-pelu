// routes/dashboard.tsx
import { json, redirect } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";
import Logout from "../components/logout";
import Reserves from "../components/reserves";
import Clients from "../components/clients";
import Inventari from "../components/inventari";
import Serveis from "../components/serveis";

export async function loader({ request }: { request: Request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");
  const user_id = session.get("user_id");

  if (!token) {
    return redirect("/login");
  }

  return json({ token, user_id });
}

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Benvingut/da a la Perruqueria Cirvianum!
        </h1>
        <p className="text-gray-600 mb-6">
          Aquí pots veure la teva informació i gestionar les reserves.
        </p>

        {/* Navegació */}
        <div className="flex flex-col space-y-4 mb-6">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full">
            <Reserves />
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full">
            <Clients />
          </button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full">
            <Inventari />
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full">
            <Serveis />
          </button>
        </div>

        {/* Component Logout amb estil */}
        <div className="mt-6">
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            <Logout />
          </button>
        </div>
      </div>
    </div>
  );
}
