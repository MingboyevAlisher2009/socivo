import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPane() {
  const notifications = [
    {
      id: "1",
      message: "John Doe started following you.",
      time: "5 min ago",
      read: false,
    },
    {
      id: "2",
      message: "Your post received 10 likes.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      message: "Jane commented on your photo.",
      time: "3 hours ago",
      read: true,
    },
    {
      id: "4",
      message: "New update available for the app.",
      time: "1 day ago",
      read: true,
    },
  ];

  return (
    <Card className="w-full sticky top-24">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          You have {notifications.filter((n) => !n.read).length} unread
          notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start gap-3">
            <Bell
              className={`h-5 w-5 ${
                notification.read ? "text-muted-foreground" : "text-primary"
              }`}
            />
            <div className="grid gap-0.5">
              <p
                className={`text-sm ${
                  notification.read ? "text-muted-foreground" : "font-medium"
                }`}
              >
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {notification.time}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
