export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">This workspace is suspended</h1>
        <p className="mt-2 max-w-md text-ink-soft">
          Contact your account owner or support to resolve this. Your data hasn't been deleted.
        </p>
      </div>
    </div>
  );
}
