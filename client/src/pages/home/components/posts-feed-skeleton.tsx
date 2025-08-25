import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PostsFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="grid gap-0.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-[200px] w-full rounded-md" />
          </CardContent>
          <CardFooter className="flex items-center gap-4 pt-4 border-t">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
