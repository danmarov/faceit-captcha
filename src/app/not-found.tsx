// src/app/not-found.tsx
import { redirect } from "next/navigation";

export default function NotFound() {
  const fallbackUrl = process.env.FALLBACK_URL!;
  redirect(fallbackUrl);
}
