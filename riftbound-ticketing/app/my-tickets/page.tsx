import { Suspense } from "react";
import { MyTicketsScreen } from "@/components/screens/MyTicketsScreen";

export default function MyTicketsPage() {
  return (
    <Suspense>
      <MyTicketsScreen />
    </Suspense>
  );
}
