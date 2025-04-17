import RunFormSkeleton from "@/app/dashboard/runs/create/form-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateRunLoading() {
  return (
    <div className="max-w-2xl w-full mx-auto pt-12">
      <Card>
        <CardHeader>
          <CardTitle>Create New Run</CardTitle>
          <CardDescription>
            Select a repository and issue to start a new run
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RunFormSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
