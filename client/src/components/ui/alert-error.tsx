import { cn } from "@/lib/utils";

interface AlertErrorProps {
  message: string;
  className?: string;
}

function AlertError({ message, className }: AlertErrorProps) {
  return (
    <p className={cn("text-sm text-destructive", className)} role="alert">
      {message}
    </p>
  );
}

export { AlertError };
