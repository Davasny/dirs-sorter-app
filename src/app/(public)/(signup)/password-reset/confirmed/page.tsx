import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">Email sent!</h1>

        <p>
          If your email is in our database, we will send you a reset link soon
        </p>
      </div>

      <Link href="/signin">Go to sign in page</Link>
    </div>
  );
}
