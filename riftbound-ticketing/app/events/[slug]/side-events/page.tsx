import { notFound } from "next/navigation";
import { EVENTS, getEvent } from "@/lib/data/catalog";
import { SideEventsScreen } from "@/components/screens/SideEventsScreen";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export default async function SideEventsPage({ params }: PageProps<"/events/[slug]/side-events">) {
  const { slug } = await params;
  const ev = getEvent(slug);
  if (!ev) notFound();
  return <SideEventsScreen ev={ev} />;
}
