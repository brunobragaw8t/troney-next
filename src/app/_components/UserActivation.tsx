import { api } from "~/trpc/server";
import Alert from "./Alert";

type Props = {
  tokenValue: string;
};

export default async function UserActivation(props: Props) {
  try {
    await api.users.activate(props.tokenValue);
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
