import { api } from "~/trpc/server";
import Alert from "./Alert";
import Button from "./Button";

type Props = {
  tokenValue: string;
};

export default async function UserActivation(props: Props) {
  try {
    await api.users.activate(props.tokenValue);
  } catch {
    return (
      <>
        <Alert
          type="error"
          message="Your activation token is invalid or has expired."
        />

        <Button type="link" href="/" label="Return to login" />
      </>
    );
  }

  return (
    <>
      <Alert
        type="success"
        message="Your account has been activated successfully!"
      />

      <Button type="link" href="/" label="Return to login" />
    </>
  );
}
