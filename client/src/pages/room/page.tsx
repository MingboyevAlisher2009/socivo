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

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const streamRef = useRef<MediaStream | null>(null);
  const { userInfo, getMessages } = useAppStore();
  const socket: any = useSocket();
  const [me, setMe] = useState<Peer>();
  const [stream, setStream] = useState<MediaStream>();
  const [peers, dispatch] = useReducer(peersReducer, {});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isUserMuted, setIsUserMuted] = useState(false);
  const [isUserVideoOff, setisUserVideoOff] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [peerReady, setPeerReady] = useState(false);

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
      <div className="relative flex flex-col w-full">
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

        <div className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 pb-32 md:pb-36">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="relative w-full">
              <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-slate-900/50 shadow-2xl ring-1 md:ring-2 ring-emerald-500/20 hover:ring-emerald-500/40 transition-all">
                <VideoPlayer
                  className="w-full h-full object-cover"
                  stream={stream as any}
                  mute={true}
                />

                {isVideoOff && (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-800 to-emerald-950 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold shadow-2xl ring-4 ring-emerald-500/20">
                      You
                    </div>
                  </div>
                )}

                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 px-2 md:px-4 py-1.5 md:py-2 flex gap-1.5 md:gap-2 items-center bg-emerald-950/80 backdrop-blur-md rounded-lg md:rounded-xl text-xs md:text-sm text-emerald-50 font-medium shadow-lg border border-emerald-500/20">
                  <span>You</span>
                  {isMuted && (
                    <MicOff className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 w-full">
              {Object.values(peers as PeerState).map((peer, i) => (
                <div
                  key={i}
                  className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-slate-900/50 shadow-2xl ring-1 md:ring-2 ring-emerald-500/20 hover:ring-emerald-500/40 transition-all"
                >
                  <VideoPlayer
                    mute={isUserMuted}
                    className="w-full h-full object-cover"
                    stream={peer.stream as any}
                  />

                  {isUserVideoOff && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-800 to-teal-950 flex items-center justify-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold shadow-2xl ring-4 ring-emerald-500/20">
                        {getUserName("initials")}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 flex gap-1.5 md:gap-2 items-center px-2 md:px-4 py-1.5 md:py-2 bg-emerald-950/80 backdrop-blur-md rounded-lg md:rounded-xl text-xs md:text-sm text-emerald-50 font-medium shadow-lg border border-emerald-500/20">
                    <span className="truncate max-w-[120px] sm:max-w-none">
                      {getUserName("full")}
                    </span>
                    {isUserMuted && (
                      <MicOff className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-2xl md:rounded-3xl">
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "secondary"}
                  className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20"
                  onClick={handleMute}
                >
                  {isMuted ? (
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  )}
                </Button>
                <span className="text-[10px] sm:text-xs text-emerald-100/70 font-medium hidden sm:block">
                  {isMuted ? "Unmute" : "Mute"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1 md:gap-2">
                <Button
                  size="lg"
                  variant={isVideoOff ? "destructive" : "secondary"}
                  className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20"
                  onClick={handleToggleVideo}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  ) : (
                    <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  )}
                </Button>
                <span className="text-[10px] sm:text-xs text-emerald-100/70 font-medium hidden sm:block">
                  {isVideoOff ? "Video" : "Stop"}
                </span>
              </div>

              <div className="w-px h-8 sm:h-10 md:h-12 bg-emerald-500/20 mx-1 sm:mx-2"></div>

              <div className="flex flex-col items-center gap-1 md:gap-2">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20"
                >
                  <Monitor className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </Button>
                <span className="text-[10px] sm:text-xs text-emerald-100/70 font-medium hidden sm:block">
                  Share
                </span>
              </div>

              <div className="w-px h-8 sm:h-10 md:h-12 bg-emerald-500/20 mx-1 sm:mx-2"></div>

              <div className="flex flex-col items-center gap-1 md:gap-2">
                <Button
                  onClick={handleEndCall}
                  size="lg"
                  variant="destructive"
                  className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl bg-red-600 hover:bg-red-700"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rotate-[135deg]" />
                </Button>
                <span className="text-[10px] sm:text-xs text-emerald-100/70 font-medium hidden sm:block">
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
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Room;
