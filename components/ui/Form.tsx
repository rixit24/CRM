import { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import clsx from "clsx";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded border border-hairline bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-ink",
        props.className
      )}
    />
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="mt-2 text-sm text-red-600">{children}</p>;
}
