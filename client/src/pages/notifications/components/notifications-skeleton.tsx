import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const NotificationSkeleton = () => (
  <Card className="p-4 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="relative">
        <div className="h-12 w-12 bg-muted rounded-full flex-shrink-0" />
        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-muted rounded-full" />
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="h-2 w-2 bg-muted rounded-full" />
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="h-14 w-14 bg-muted rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-4/5" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        </div>

        <div className="h-3 bg-muted rounded w-16" />
      </div>
    </div>
  </Card>
);

export const NotificationsSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="animate-pulse bg-transparent"
          >
            <div className="h-4 bg-muted rounded w-12" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="animate-pulse bg-transparent"
          >
            <div className="h-4 bg-muted rounded w-16" />
          </Button>
          <Button variant="ghost" size="sm" disabled className="animate-pulse">
            <div className="h-4 bg-muted rounded w-20" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <NotificationSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
