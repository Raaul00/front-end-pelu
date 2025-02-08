import { json, redirect } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server";

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
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const password_confirmation = formData.get("passwordConfirmation");

  if (!name || !email || !password || !password_confirmation) {
    return json({ message: "All fields are required" }, { status: 400 });
  }

  if (password !== password_confirmation) {
    return json({ message: "Passwords do not match" }, { status: 400 });
  }

  const apiUrl = "http://localhost/api/register";
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation,
    }),
  });

  const responseBody = await response.json(); // ✅ Llegeix només una vegada

  if (!response.ok) {
    return json(
      {
        message: responseBody.message || "Registration failed",
        errors: responseBody.errors,
      },
      { status: 400 }
    );
  }

  const token = responseBody.data?.token; // ✅ Accedeix al token directament

  if (!token) {
    return json({ message: "Token missing from response" }, { status: 500 });
  }

  const session = await sessionStorage.getSession();
  session.set("token", token);

  const setCookie = await sessionStorage.commitSession(session);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": setCookie,
    },
  });
}

export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Perruqueria Cirvianum
      </h1>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Registra&apos;t
        </h2>
        <form method="post">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="w-full p-2 mb-4 border border-gray-300 rounded bg-white text-black"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full p-2 mb-4 border border-gray-300 rounded bg-white text-black"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full p-2 mb-4 border border-gray-300 rounded bg-white text-black"
          />
          <input
            type="password"
            name="passwordConfirmation"
            placeholder="Confirm Password"
            required
            className="w-full p-2 mb-4 border border-gray-300 rounded bg-white text-black"
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-white p-2 rounded bg-green-800"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
