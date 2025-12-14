import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  stream: MediaStream;
  className?: string;
  mute?: boolean;
};

export default function VideoPlayer({ stream, className, mute = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;

    let rafId: number;

    const checkReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setReady(true);
        return;
      }
      rafId = requestAnimationFrame(checkReady);
    };

    checkReady();

    return () => cancelAnimationFrame(rafId);
  }, [stream]);

  return (
    <div
      className={`relative w-full h-full bg-black overflow-hidden ${className}`}
    >
      {/* LOADER */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/70 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={mute}
        className={`
          w-full h-full object-cover
          transition-opacity duration-300
          ${ready ? "opacity-100" : "opacity-0"}
        `}
      />
    </div>
  );
}
