import { STATUS_CODE } from "@std/http/status";

export default function redirect(
  location: string,
  status: number = STATUS_CODE.Found,
): Response {
  return new Response(null, {
    status: status,
    headers: {
      Location: location,
    },
  });
}
