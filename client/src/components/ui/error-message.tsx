import type { FieldError } from "react-hook-form";

interface ErrorMessageProps {
  error: FieldError | undefined;
}

function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  return <p className="text-sm text-destructive">{error.message}</p>;
}

export { ErrorMessage };
