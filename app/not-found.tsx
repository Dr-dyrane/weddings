import Link from "next/link";

export default function NotFound() {
  return (
    <main className="invitation-missing">
      <p className="kicker">Invitation unavailable</p>
      <h1>This invitation can’t be opened.</h1>
      <p>The link may have changed or expired.</p>
      <Link href="/the_ogranyas">View the public invitation</Link>
    </main>
  );
}
