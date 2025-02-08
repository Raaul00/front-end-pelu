// components/Clients.tsx
import { Link } from "@remix-run/react";

export default function Clients() {
  return (
    <div className="text-center">
      <Link
        to="/clients"
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        Anar a Clients
      </Link>
    </div>
  );
}
