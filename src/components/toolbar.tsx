import { JSX, PropsWithChildren } from "react";

export function Toolbar({ children }: PropsWithChildren) {
  return <div className="flex justify-between items-start">{children}</div>;
}

export function ToolbarTitle({
  children,
  description,
}: PropsWithChildren<{
  description?: string | JSX.Element;
}>) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold truncate flex items-center gap-2">
        {children}
      </h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function ToolbarAction({ children }: PropsWithChildren) {
  return <div className="flex items-center gap-2">{children}</div>;
}
