import { Link } from "@remix-run/react";

export default function Reservations() {
  return (
    <div className="text-center">
      <Link
        to="/reserves"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        Anar a Reserves
      </Link>
    </div>
  );
}
