import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";

const PostSkeleton = () => {
  return (
    <div className="max-w-4xl grid lg:grid-cols-3 grid-cols-1 gap-5 mx-auto">
      <div className="lg:col-span-2 col-span-1 space-y-5">
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-row items-center gap-3 p-4">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
              <div className="grid gap-0.5">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>

            <div className="w-full h-96 bg-muted animate-pulse" />

            <div className="flex gap-3 p-4 border-b">
              <Button
                variant="ghost"
                disabled
                className="flex items-center gap-1"
              >
                <Heart className="h-5 w-5 text-muted-foreground" />
                <div className="h-4 w-6 bg-muted rounded animate-pulse" />
              </Button>
              <Button
                variant="ghost"
                disabled
                className="flex items-center gap-1"
              >
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <div className="h-4 w-6 bg-muted rounded animate-pulse" />
              </Button>
              <Button
                variant="ghost"
                disabled
                className="flex items-center gap-1"
              >
                <Share2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Share</span>
              </Button>
            </div>

            <div className="p-4 space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pb-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-20 w-full bg-muted rounded-md animate-pulse" />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button size="sm" disabled className="gap-2">
                  Post
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-l-2 border-muted pl-4 pb-3">
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-2">
                          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 w-full">
                      <div className="h-4 w-full bg-muted rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="h-16 w-16 bg-muted rounded-full mx-auto animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-muted rounded mx-auto animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded mx-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded mx-auto animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="h-5 w-20 bg-muted rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
};

export default PostSkeleton;
