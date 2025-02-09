import { Link } from "@remix-run/react";

export default function Services() {
  return (
    <div className="text-center">
      <Link
        to="/serveis"
        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        Anar a Serveis
      </Link>
    </div>
  );
}
