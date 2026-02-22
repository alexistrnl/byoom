import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-[var(--color-night)]">
          🌿 Byoom
        </h1>
        <p className="mb-2 text-2xl text-gray-700">
          Identifie. Soigne. Collectionne.
        </p>
        <p className="mb-8 text-lg text-gray-600">
          Votre Pokédex végétal intelligent
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-md bg-[var(--color-moss)] px-6 py-3 font-medium text-white hover:opacity-90"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-white px-6 py-3 font-medium text-[var(--color-moss)] border-2 border-[var(--color-moss)] hover:bg-[var(--color-cream)]"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
