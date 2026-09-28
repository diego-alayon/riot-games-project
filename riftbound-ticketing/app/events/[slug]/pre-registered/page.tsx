import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EVENTS, getEvent } from "@/lib/data/catalog";
import { PreRegisteredScreen } from "@/components/screens/PreRegisteredScreen";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export default async function PreRegisteredPage({ params }: PageProps<"/events/[slug]/pre-registered">) {
  const { slug } = await params;
  const ev = getEvent(slug);
  if (!ev) notFound();
  return (
    <Suspense>
      <PreRegisteredScreen ev={ev} />
    </Suspense>
  );
}
