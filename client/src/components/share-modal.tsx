import { useState } from "react";
import {
  Check,
  Copy,
  Facebook,
  Mail,
  MessageCircle,
  Twitter,
  Linkedin,
  Send,
  MessageSquare,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ShareModalProps {
  url?: string;
  title?: string;
  imageUrl?: string;
  isOpen: boolean;
  onOpenChange: () => void;
}

export function ShareModal({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "Check this out!",
  imageUrl = "",
  isOpen,
  onOpenChange,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const socialPlatforms = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
      color:
        "hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      color:
        "hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-600/30",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
      color:
        "hover:bg-blue-700/10 hover:text-blue-300 hover:border-blue-700/30",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: `https://www.instagram.com/`,
      color:
        "hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/30",
    },
    {
      name: "Reddit",
      icon: MessageSquare,
      url: `https://reddit.com/submit?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title)}`,
      color:
        "hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      color:
        "hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30",
    },
    {
      name: "Telegram",
      icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
      color:
        "hover:bg-blue-400/10 hover:text-blue-300 hover:border-blue-400/30",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(
        title
      )}&body=${encodeURIComponent(
        `${title}\n\n${url}${imageUrl ? `\n\nImage: ${imageUrl}` : ""}`
      )}`,
      color:
        "hover:bg-gray-500/10 hover:text-gray-300 hover:border-gray-500/30",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-foreground text-lg font-semibold">
            Share post
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Share this post with your friends and followers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={url}
                readOnly
                className="bg-muted/50 border-border text-sm text-foreground"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0 border-border hover:bg-accent bg-transparent"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="grid grid-cols-4 gap-3">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.name}
                  variant="outline"
                  size="sm"
                  className={`flex flex-col items-center justify-center h-16 border-border bg-card hover:bg-accent/50 transition-all duration-200 ${platform.color}`}
                  onClick={() =>
                    window.open(platform.url, "_blank", "noopener,noreferrer")
                  }
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
