import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";

interface Reserva {
  id: number;
  clientName: string;
  date: string;
  status: string;
}

export default function ReservesList() {
  const [reserves, setReserves] = useState<Reserva[]>([]);
  const [error, setError] = useState<string | null>(null);
  useNavigate();

  // 🔹 GET: Obtenir les reserves des del servidor
  useEffect(() => {
    const fetchReserves = async () => {
      try {
        const response = await fetch("http://localhost/api/reserves", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error en carregar les reserves");
        }

        const data: Reserva[] = await response.json();
        setReserves(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconegut en carregar les reserves");
        }
      }
    };

    fetchReserves();
  }, []);

  // 🔹 PUT: Modificar una reserva
  const handleEdit = async (id: number) => {
    const newStatus = prompt("Introdueix el nou estat de la reserva:");

    if (newStatus) {
      try {
        const response = await fetch(`http://localhost/api/reserves/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          alert("Reserva actualitzada correctament");
          setReserves((prev) =>
            prev.map((reserva) =>
              reserva.id === id ? { ...reserva, status: newStatus } : reserva
            )
          );
        } else {
          alert("Error en modificar la reserva");
        }
      } catch (error: unknown) {
        alert("Error del servidor en modificar la reserva");
      }
    }
  };

  // 🔹 DELETE: Eliminar una reserva
  const handleDelete = async (id: number) => {
    if (confirm("Estàs segur que vols eliminar aquesta reserva?")) {
      try {
        const response = await fetch(`http://localhost/api/reserves/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Reserva eliminada correctament");
          setReserves((prev) => prev.filter((reserva) => reserva.id !== id));
        } else {
          alert("Error en eliminar la reserva");
        }
      } catch (error: unknown) {
        alert("Error del servidor en eliminar la reserva");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Gestió de Reserves
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-5xl mx-auto">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : reserves.length === 0 ? (
          <p className="text-center text-gray-600">
            No hi ha reserves disponibles.
          </p>
        ) : (
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left">Nom del Client</th>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Estat</th>
                <th className="p-3 text-center">Accions</th>
              </tr>
            </thead>
            <tbody>
              {reserves.map((reserva) => (
                <tr
                  key={reserva.id}
                  className="bg-gray-100 hover:bg-gray-200 transition"
                >
                  <td className="p-3 border text-black">
                    {reserva.clientName}
                  </td>
                  <td className="p-3 border text-black">{reserva.date}</td>
                  <td className="p-3 border text-black">{reserva.status}</td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => handleEdit(reserva.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(reserva.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
