import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl">Thank you for signing up!</h1>

        <p>We sent an activation link to your email</p>
      </div>

      <Link href="/signin">Go to sign in page</Link>
    </div>
  );
}
