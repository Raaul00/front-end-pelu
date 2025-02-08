// components/Logout.tsx
import { Form } from "@remix-run/react";

export default function Logout() {
  return (
    <Form method="post" action="/logout">
      <button type="submit">Logout</button>
    </Form>
  );
}
