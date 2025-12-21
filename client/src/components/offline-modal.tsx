import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WifiOff } from "lucide-react";

interface OfflineModalProps {
  open: boolean;
}

export function OfflineModal({ open }: OfflineModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          <WifiOff className="h-10 w-10 text-destructive mb-2" />
          <DialogTitle>You’re offline</DialogTitle>
          <DialogDescription>
            Check your internet connection to continue.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
