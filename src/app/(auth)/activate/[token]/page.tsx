import { ActivateView } from "@/modules/auth/ui/views/activate-view";

interface ActivateProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function Activate({ params }: ActivateProps) {
  const { token } = await params;

  return <ActivateView token={token} />;
}
