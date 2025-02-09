// routes/mostrar_reserves.tsx
import { useEffect, useState } from "react";

// Exemple d'una ruta API per obtenir reserves
const API_URL = "http://localhost/api/reservations"; // Assegura't que aquesta és la URL correcta

export default function MostrarReserves() {
  interface Reserve {
    id: number;
    client_name: string;
    date: string;
    service: string;
  }

  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [loading, setLoading] = useState(true);

  // Funció per obtenir les reserves des de l'API
  useEffect(() => {
    const fetchReserves = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Posa el token aquí
          },
        });
        if (!response.ok) {
          throw new Error("Error al carregar les reserves");
        }
        const data = await response.json();
        setReserves(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReserves();
  }, []);

  if (loading) {
    return <div>Carregant reserves...</div>;
  }

  return (
    <div>
      <h1>Les teves reserves</h1>
      {reserves.length === 0 ? (
        <p>No hi ha reserves.</p>
      ) : (
        <ul>
          {reserves.map((reserva) => (
            <li key={reserva.id}>
              <h3>Client: {reserva.client_name}</h3>
              <p>Data de la reserva: {reserva.date}</p>
              <p>Servei: {reserva.service}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
