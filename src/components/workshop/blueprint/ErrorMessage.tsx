
interface ErrorMessageProps {
  errorMessage: string | null;
}

export function ErrorMessage({ errorMessage }: ErrorMessageProps) {
  if (!errorMessage) return null;
  
  return (
    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
      <p className="font-medium">Error generating blueprint:</p>
      <p>{errorMessage}</p>
    </div>
  );
}
