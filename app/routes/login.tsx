import { json, redirect } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";
import { Link } from "@remix-run/react";

// Loader per GET - Comprova si l'usuari ja està logat
export async function loader({ request }: { request: Request }) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const token = session.get("token");

  if (token) {
    return redirect("/dashboard"); // Si l'usuari ja està logat, redirigeix-lo al tauler
  }

  return json({});
}

export async function action({ request }: { request: Request }) {
  const formData = new URLSearchParams(await request.text());
  const email = formData.get("email");
  const password = formData.get("password");

  // Crida a l'API per verificar les dades
  const response = await fetch("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const responseBody = await response.json();
  console.log("API response:", responseBody);

  if (!response.ok) {
    return json(
      { message: responseBody.message || "Login failed" },
      { status: 401 }
    );
  }

  // 🔹 Comprovar que el token existeix
  if (!responseBody.data || !responseBody.data.token) {
    return json(
      { message: "Login failed: No token received" },
      { status: 401 }
    );
  }

  const token = responseBody.data.token;

  // 🔹 Emmagatzemem el token a la sessió
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  session.set("token", token);
  const setCookie = await sessionStorage.commitSession(session);

  console.log("Token guardat a la sessió:", token); // 🐛 Debug

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": setCookie,
    },
  });
}

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <form method="post" className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          No tens un compte?
          <Link to="/register" className="text-green-600 hover:underline ml-1">
            Registra&apos;t aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
