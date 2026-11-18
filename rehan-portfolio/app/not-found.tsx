import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-5 pt-24 sm:px-8">
      <p className="label">404</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">Nothing here.</h1>
      <Link href="/" className="mt-8 w-fit text-accent underline underline-offset-4">Back to home</Link>
    </section>
  );
}
