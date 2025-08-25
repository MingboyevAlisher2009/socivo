import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function SuggestedUsers() {
  const suggestedUsers = [
    {
      id: "1",
      username: "johndoe",
      avatar: "/placeholder.svg?height=40&width=40",
      name: "John Doe",
    },
    {
      id: "2",
      username: "janedoe",
      avatar: "/placeholder.svg?height=40&width=40",
      name: "Jane Doe",
    },
    {
      id: "3",
      username: "peterpan",
      avatar: "/placeholder.svg?height=40&width=40",
      name: "Peter Pan",
    },
  ];

  return (
    <Card className="w-full sticky top-24">
      <CardHeader>
        <CardTitle>Suggested Users</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={`@${user.username}`}
                />
                <AvatarFallback>
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <UserPlus className="lg:mr-2 h-4 w-4" />
              <p className="hidden lg:block">Follow</p>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
