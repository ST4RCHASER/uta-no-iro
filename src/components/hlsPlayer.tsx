import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react";
import Hls from "hls.js";
// @ts-expect-error - no types available
interface Props extends React.HTMLProps<HTMLVideoElement> {
    manifest: string;
    onEnded?: () => void;
    onError?: (event: Event) => void;
}

const HLSPlayer = forwardRef<HTMLVideoElement, Props>(
    ({ manifest, onEnded, onError, ...props }, ref) => {
        const videoRef = useRef<HTMLVideoElement>(null);

        useImperativeHandle(ref, () => videoRef.current!);

        useEffect(() => {
            const src = manifest;
            const { current: video } = videoRef;
            if (!video) return;

            let hls: Hls | null = null;
            if (video.canPlayType("application/vnd.apple.mpegurl")) { // Safari
                video.src = src;
            } else if (Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (hls && hls?.audioTracks?.length > 0) {
                        hls.audioTrack = 0; // Force selection of the first audio track
                    }
                    video.play().catch((err) => {
                        console.error("Error while trying to play the video:", err);
                    });
                });

                hls.on(Hls.Events.ERROR, (event, data: {type: string, details: string}) => {
                    console.error(`HLS.js error: ${data.type} - ${data.details}`, data);
                    if (onError) {
                        onError(new Event("hls-error")); // Pass custom event or data
                    }
                });
            }

            const handleEnded = () => {
                console.log("Video playback ended.");
                if (onEnded) {
                    onEnded();
                }
            };

            const handleError = (event: Event) => {
                console.error("Video playback error:", event);
                if (onError) {
                    onError(event);
                }
            };

            video.addEventListener('ended', handleEnded);
            video.addEventListener('error', handleError);

            return () => {
                hls?.destroy();
                if (video) {
                    video.removeEventListener('ended', handleEnded);
                    video.removeEventListener('error', handleError);
                }
            };
        }, [manifest, onEnded, onError]);

        return <video {...props} ref={videoRef} controls />;
    }
);

HLSPlayer.displayName = "HLSPlayer";

export default HLSPlayer;