import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">
        AI Knowledge Assistant
      </h1>

      <Link
        href="/dashboard"
        className="rounded bg-black px-4 py-2 text-white"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}