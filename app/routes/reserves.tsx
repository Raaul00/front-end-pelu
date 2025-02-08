// routes/reservations.tsx
import { Link } from "@remix-run/react";

export default function ReservationsRoute() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Reserves</h1>
        <p className="text-gray-600 mb-6">Aquí pots gestionar les reserves.</p>

        {/* Opcions per llistar o afegir reserves */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/llistar_reserves"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Llistar Reserves
          </Link>
          <Link
            to="/crear_reserva"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            Afegir Reserva
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
