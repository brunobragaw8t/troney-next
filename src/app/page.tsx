import IconTroney from "./_components/icons/IconTroney";
import AuthForms from "./_components/AuthForms";

export default async function Home() {
  return (
    <>
      <main className="flex min-h-screen items-center justify-center">
        <div className="bg-secondary-2 flex w-96 flex-col gap-8 rounded-xl p-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-white">
              <IconTroney />
              <h1>Troney</h1>
            </div>

            <span className="text-secondary-4 text-center font-medium">
              Track your expenses with ease
            </span>
          </div>

          <AuthForms />
        </div>
      </main>
    </>
  );
}
