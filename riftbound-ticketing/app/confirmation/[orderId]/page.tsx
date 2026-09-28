import { ConfirmationScreen } from "@/components/screens/ConfirmationScreen";

export default async function ConfirmationPage({ params }: PageProps<"/confirmation/[orderId]">) {
  const { orderId } = await params;
  return <ConfirmationScreen orderId={orderId} />;
}
