import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PropsWithChildren } from "react";

export default function CreateRunLayout({
  children,
}: PropsWithChildren<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-2xl w-full mx-auto space-y-6 pt-12">
      <Card>
        <CardHeader>
          <CardTitle>Create New Run</CardTitle>
          <CardDescription>
            Select a repository and issue to start a new run
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
      <div className="flex gap-4 w-full items-center justify-center overflow-hidden">
        <Separator className="w-auto" />
        <p className="text-muted-foreground text-center">or</p>
        <Separator className="w-auto" />
      </div>

      <p className="text-center text-muted-foreground">
        Alternatively, you can mention{" "}
        <span className="font-bold">@anthony-run</span> in a comment on a GitHub
        <br />
        issue and it will automatically create a run for you.
      </p>
    </div>
  );
}
