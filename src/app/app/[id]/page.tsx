import { supabase } from "@/lib/supabase";
import AppDetailsClient from "./AppDetailsClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  const { data, error } = await supabase.from("apps").select("id");

  if (error) {
    console.error("Failed to load app IDs for static export:", error);
    return [];
  }

  return (data ?? [])
    .filter((app) => app?.id)
    .map((app) => ({ id: String(app.id) }));
}

export default function AppDetailsPage() {
  return <AppDetailsClient />;
}
