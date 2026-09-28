"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surface";
import { Heading } from "@/components/ui/Typography";
import { IconLock } from "@/components/icons";
import { ReqMarker } from "@/components/trace/ReqMarker";
import { Container } from "@/components/patterns/Layout";
import { useStore } from "@/lib/state/store";

/**
 * P-11 stand-in. In production this is a redirect to Riot Sign-On; the
 * prototype simulates the round trip and returns to `next`.
 */
export function LoginScreen() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const { signIn } = useStore();

  return (
    <Container className="py-10 md:py-20">
      <Card className="relative mx-auto max-w-105 p-6! md:p-8! text-center">
        <span className="mx-auto inline-flex items-center justify-center size-12 rounded-pill bg-surface-muted text-ink">
          <IconLock size={20} />
        </span>
        <Heading level="heading-lg" as="h1" className="mt-4">Sign in to continue</Heading>
        <p className="mt-2 text-body text-muted">
          Buying passes and viewing your tickets needs your Riot account. You&apos;ll come right back here.
        </p>
        <Button
          variant="primary"
          size="lg"
          block
          className="mt-6"
          onClick={() => {
            signIn();
            router.replace(next);
          }}
        >
          Continue with Riot account
        </Button>
        <p className="mt-3 text-fine text-disabled">Simulated Riot Sign-On (RSO) for the prototype.</p>
        <ReqMarker ids={["ACC-02", "ACC-03"]} inset />
      </Card>
    </Container>
  );
}
