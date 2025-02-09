import { Link } from "@remix-run/react";

export default function Inventory() {
  return (
    <div className="text-center">
      <Link
        to="/inventari"
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        Anar a Inventari
      </Link>
    </div>
  );
}
