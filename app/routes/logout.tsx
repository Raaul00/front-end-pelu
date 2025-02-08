// routes/logout.tsx
import { redirect } from "@remix-run/node";
import { sessionStorage } from "../utils/session.server"; // Ajusta el camí segons la teva estructura de projecte

export const action = async ({ request }: { request: Request }) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  // Destruïm la sessió
  const setCookie = await sessionStorage.destroySession(session);

  // Redirigim a la pàgina de login
  return redirect("/login", {
    headers: {
      "Set-Cookie": setCookie,
    },
  });
};
