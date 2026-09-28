import { notFound } from "next/navigation";
import { EVENTS, getEvent } from "@/lib/data/catalog";
import { EventPassesScreen } from "@/components/screens/EventPassesScreen";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export default async function EventPassesPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const ev = getEvent(slug);
  if (!ev) notFound();
  return <EventPassesScreen ev={ev} />;
}
