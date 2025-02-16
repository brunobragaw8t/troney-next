import { Suspense } from "react";
import IconLoader from "~/app/_components/icons/IconLoader";
import UserActivation from "~/app/_components/UserActivation";

type Props = {
  params: Promise<{
    tokenValue: string;
  }>;
};

export default async function Activate(props: Props) {
  const tokenValue = (await props.params).tokenValue;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <IconLoader className="h-6 w-6 text-white" />
        </div>
      }
    >
      <UserActivation tokenValue={tokenValue} />
    </Suspense>
  );
}
