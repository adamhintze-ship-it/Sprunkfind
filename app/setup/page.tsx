import SetupChecklist from "@/components/SetupChecklist";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-4xl">🧸🔧</p>
        <h1 className="mt-2 text-3xl font-extrabold text-sprunki-accent">
          SprunkFind setup
        </h1>
        <p className="mt-1 text-sm text-white/60">
          A live checklist of what&apos;s configured. Green means you&apos;re good to go.
        </p>
      </div>
      <SetupChecklist />
    </main>
  );
}
