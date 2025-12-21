import { useSocket } from "@/context/socket-context";
import { useAppStore } from "@/store";
import { useEffect, useReducer, useRef, useState } from "react";
import Peer from "peerjs";
import VideoPlayer from "./components/video-player";
import { useNavigate, useParams } from "react-router-dom";
import { peersReducer, type PeerState } from "@/reducer/peer-reducer";
import { addPeerStreamAction } from "@/reducer/peer-actions";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Phone,
  VideoIcon,
  VideoOff,
  Monitor,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PeerLoader } from "./components/peer-loader";
import { cn } from "@/lib/utils";

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const streamRef = useRef<MediaStream | null>(null);
  const {
    userInfo,
    getMessages,
    isMuted,
    isVideoOff,
    isUserMuted,
    isUserVideoOff,
    setIsMuted,
    setIsVideoOff,
    setIsUserMuted,
    setisUserVideoOff,
  } = useAppStore();
  const socket: any = useSocket();
  const [me, setMe] = useState<Peer>();
  const [stream, setStream] = useState<MediaStream>();
  const [peers, dispatch] = useReducer(peersReducer, {});
  const [isOpen, setIsOpen] = useState(false);
  const [peerReady, setPeerReady] = useState(false);
  const [switchScreen, setSwitchScreen] = useState("peer");

  useEffect(() => {
    if (!userInfo?.id) return;

    try {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          setStream(stream);
        });
    } catch (error) {
      console.log(error);
    }

    const peer = new Peer(userInfo.id, {
      host: import.meta.env.VITE_PEER_HOST,
      port: 443,
      path: "/",
      secure: true,
    });

    peer.on("open", (peerId) => {
      setMe(peer);

      if (streamRef.current) {
        socket.emit("join-room", { peerId, roomId: id, ready: true });
      } else {
        const checkStream = setInterval(() => {
          if (streamRef.current) {
            socket.emit("join-room", { peerId, roomId: id, ready: true });
            clearInterval(checkStream);
          }
        }, 100);
      }
      setPeerReady(true);
    });

    const handleIncomingCall = (call: any) => {
      if (!streamRef.current) {
        const interval = setInterval(() => {
          if (streamRef.current) {
            call.answer(streamRef.current);
            clearInterval(interval);
          }
        }, 100);
        return;
      }
      call.answer(streamRef.current);

      call.on("stream", (peerStream: any) => {
        dispatch(addPeerStreamAction(call.peer, peerStream));
      });

      call.on("error", (err: any) => console.error("Call error:", err));
    };

    peer?.on("call", handleIncomingCall);

    socket.on("video-tuned-on", () => {
      setisUserVideoOff(true);
    });

    socket.on("video-tuned-off", () => {
      setisUserVideoOff(false);
    });

    socket.on("muted-user", () => {
      setIsUserMuted(false);
    });

    socket.on("unmuted-user", () => {
      setIsUserMuted(true);
    });

    socket.on("call-ended", () => {
      setIsOpen(true);
    });

    return () => {
      peer.destroy();
      socket.off("video-tuned-on");
      socket.off("video-tuned-off");
      socket.off("muted-user");
      socket.off("unmuted-user");
      socket.off("call-ended");
      streamRef.current?.getTracks().forEach((track) => {
        if (track.readyState == "live") {
          track.stop();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!me) return;

    const handleUserJoined = ({ peerId }: { peerId: string }) => {
      if (peerId === me.id) return;

      if (!streamRef.current) return;

      const call = me.call(peerId, streamRef.current);
      call.on("stream", (peerStream) => {
        dispatch(addPeerStreamAction(peerId, peerStream));
      });
      call.on("error", console.error);
    };

    socket.on("user-joined", handleUserJoined);

    return () => {
      socket.off("user-joined", handleUserJoined);
    };
  }, [me, streamRef.current, dispatch]);

  const handleToggleVideo = () => {
    if (isVideoOff) {
      setIsVideoOff(false);
      socket.emit("video-off", { peerId: me?.id, roomId: id });
    } else {
      setIsVideoOff(true);
      socket.emit("video-on", { peerId: me?.id, roomId: id });
    }
  };

  const handleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      socket.emit("mute", { peerId: me?.id, roomId: id });
    } else {
      setIsMuted(true);
      socket.emit("unmute", { peerId: me?.id, roomId: id });
    }
  };

  const handleEndCall = () => {
    const user = JSON.parse(
      sessionStorage.getItem("selected-chat-data") as any
    );

    socket.emit("end-call", { roomId: id });
    getMessages(user);
    navigate("/direct");
    stream?.getTracks().forEach((track) => {
      if (track.readyState == "live") {
        track.stop();
      }
    });
  };

  const handleClose = () => {
    const user = JSON.parse(
      sessionStorage.getItem("selected-chat-data") as any
    );
    setIsOpen(false);
    getMessages(user);
    navigate("/direct");
    stream?.getTracks().forEach((track) => {
      if (track.readyState == "live") {
        track.stop();
      }
    });
  };

  const getUserName = (state: "full" | "initials") => {
    const user = JSON.parse(
      sessionStorage.getItem("selected-chat-data") as any
    );
    if (state === "full") {
      return user?.first_name
        ? `${user.first_name} ${user.last_name || ""}`
        : user?.username;
    } else {
      const initials = user?.first_name
        ? `${user?.first_name.charAt(0).toUpperCase()}${
            user?.last_name ? user?.last_name.charAt(0).toUpperCase() : ""
          }`
        : user.username.charAt(0).toUpperCase();

      return initials;
    }
  };

  const participantCount = Object.keys(peers).length + 1;

  return (
    <>
      {!peerReady && <PeerLoader />}
      <div className="flex flex-col h-[80vh] text-[#e9edef] overflow-hidden">
        <div className="sticky top-0 left-0 right-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-aut">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-2 text-emerald-50/90">
                <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
                <span className="text-xs md:text-sm font-medium">
                  <span className="hidden sm:inline">
                    {participantCount}{" "}
                    {participantCount === 1 ? "participant" : "participants"}
                  </span>
                  <span className="sm:hidden">{participantCount}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative p-4 md:p-6 lg:p-10">
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              onClick={() => setSwitchScreen("peer")}
              className={cn(
                switchScreen === "peer"
                  ? "relative w-full h-full max-w-5xl aspect-video rounded-3xl overflow-hidden"
                  : "absolute top-4 right-4 md:bottom-6 md:right-6 w-32 h-40 md:w-44 md:h-28 z-40 lg:w-56 lg:h-32 rounded-xl md:rounded-2xl overflow-hidden",
                "bg-gradient-to-br from-[#0b141a] to-[#121b22]",
                "border border-primary/50 shadow-xl transition-all duration-500",
                isUserVideoOff && "flex items-center justify-center"
              )}
            >
              {isUserVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-gradient-to-br from-[#0b141a] to-[#121b22]">
                  <div
                    className={cn(
                      "rounded-full bg-emerald-600 flex items-center justify-center font-bold shadow-xl border-2 md:border-4 border-emerald-500/20",
                      switchScreen === "peer"
                        ? "w-32 h-32 text-4xl"
                        : "w-20 h-20"
                    )}
                  >
                    {getUserName("initials")}
                  </div>
                </div>
              )}
              {Object.values(peers).length && (
                <VideoPlayer
                  className="w-full h-full object-cover"
                  stream={Object.values(peers as PeerState)[0].stream as any}
                  mute={isUserMuted}
                />
              )}

              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-50 flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-primary/5 backdrop-blur-md rounded-lg text-[10px] md:text-xs font-medium border border-primary/10">
                <span>{getUserName("full")}</span>
                {isUserMuted && <MicOff className="w-3 h-3 text-red-500" />}
              </div>
            </div>

            <div
              onClick={() => setSwitchScreen("me")}
              className={cn(
                switchScreen === "me"
                  ? "relative w-full h-full max-w-5xl aspect-video rounded-3xl overflow-hidden"
                  : "absolute top-4 right-4 md:bottom-6 md:right-6 w-32 h-40 md:w-44 md:h-28 z-40 lg:w-56 lg:h-32 rounded-xl md:rounded-2xl overflow-hidden",
                "bg-gradient-to-br from-[#0b141a] to-[#121b22]",
                "border border-primary/50 shadow-xl transition-all duration-500",
                isVideoOff && "flex items-center justify-center"
              )}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {isVideoOff ? (
                  <div
                    className={cn(
                      "rounded-full bg-emerald-600 flex items-center justify-center font-bold shadow-xl border-2 md:border-4 border-emerald-500/20",
                      switchScreen === "me" ? "w-32 h-32 text-4xl" : "w-20 h-20"
                    )}
                  >
                    You
                  </div>
                ) : (
                  <VideoPlayer
                    className="w-full h-full object-cover"
                    stream={stream as any}
                  />
                )}
              </div>
              <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 flex w-fit line-clamp-1 items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-primary/5 backdrop-blur-md rounded-lg text-[10px] md:text-xs font-medium border border-primary/10">
                <span>You</span>
                {isMuted && <MicOff className="w-3 h-3 text-red-500" />}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 flex justify-center z-40">
          <div className="bg-primary/10 backdrop-blur-xl border border-primary/10 shadow-2xl px-6 py-4 rounded-[2.5rem] md:rounded-full">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex flex-col items-center gap-1.5">
                <Button
                  size="icon"
                  variant={isMuted ? "destructive" : "secondary"}
                  className={cn(
                    "h-12 w-12 md:h-14 md:w-14 rounded-full transition-transform active:scale-90",
                    !isMuted && "bg-white/10 hover:bg-white/20 text-white"
                  )}
                  onClick={handleMute}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Mic className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </Button>
                <span className="text-[10px] text-white/50 font-medium hidden md:inline">
                  Mute
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <Button
                  size="icon"
                  variant={isVideoOff ? "destructive" : "secondary"}
                  className={cn(
                    "h-12 w-12 md:h-14 md:w-14 rounded-full transition-transform active:scale-90",
                    !isVideoOff && "bg-white/10 hover:bg-white/20 text-white"
                  )}
                  onClick={handleToggleVideo}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <VideoIcon className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </Button>
                <span className="text-[10px] text-white/50 font-medium hidden md:inline">
                  Video
                </span>
              </div>

              <div className="hidden md:flex flex-col items-center gap-1.5">
                <Button
                  size="icon"
                  className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-90"
                >
                  <Monitor className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
                <span className="text-[10px] text-white/50 font-medium hidden md:inline">
                  Share
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <Button
                  onClick={handleEndCall}
                  size="icon"
                  variant="destructive"
                  className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#ea0038] hover:bg-[#ff1a4d] transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(234,0,56,0.3)]"
                >
                  <Phone className="w-5 h-5 md:w-6 md:h-6 rotate-[135deg] fill-white" />
                </Button>
                <span className="text-[10px] text-white/50 font-medium hidden md:inline">
                  End
                </span>
              </div>
            </div>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Call Ended</DialogTitle>
              <DialogDescription>
                Your call has ended. Thank you for using our service!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Room;
