import { useState, useEffect } from "react";
import { redirect } from "@remix-run/node";

const ProtectedPage = () => {
  interface User {
    name: string;
  }

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("http://localhost/api/user", {
      credentials: "include", // Important per enviar les cookies
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No autenticat");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data); // L'usuari està autenticat
      })
      .catch(() => {
        redirect("/login"); // Redirigeix a login si no està autenticat
      });
  }, []);

  if (!user) return <div>Loading...</div>;

  return <div>Welcome, {user.name}!</div>;
};

export default ProtectedPage;
