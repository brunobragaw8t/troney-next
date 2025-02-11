import Alert from "~/app/_components/Alert";
import { api } from "~/trpc/server";

type Props = {
  params: Promise<{
    tokenValue: string;
  }>;
};

export default async function Activate(props: Props) {
  const tokenValue = (await props.params).tokenValue;

  try {
    await api.activationTokens.getItem(tokenValue);
  } catch {
    return (
      <Alert
        type="error"
        message="Your activation token is invalid or has expired."
      />
    );
  }

  return (
    <Alert
      type="success"
      message="Your account has been activated successfully!"
    />
  );
}
