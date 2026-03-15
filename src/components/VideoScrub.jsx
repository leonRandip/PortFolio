import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function VideoScrub() {
  const containerRef  = useRef(null);
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const bgLightsRef   = useRef(null);
  const cageMeshRef   = useRef(null);
  const vignetteRef   = useRef(null);

  const [videoSrc, setVideoSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const framesRef      = useRef([]);
  // FIX #3: track the last-drawn frame index so resize can redraw it
  const currentFrameRef = useRef(0);

  // Pre-fetch video as blob
  useEffect(() => {
    const videoUrl = '/video/mcgregor-aldo-ko-web.mp4';
    let objectUrl = null;

    fetch(videoUrl)
      .then((res) => res.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
      })
      .catch((err) => {
        console.error('Error loading video:', err);
        setVideoSrc(videoUrl);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  useGSAP(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !videoSrc || !canvas) return;

    const ctx = canvas.getContext('2d');
    let scrollTween = null;
    // FIX #1: cancellation flag to stop the async loop after unmount
    let isCancelled = false;

    // Helper to draw a frame maintaining aspect ratio (object-cover)
    const drawFrame = (index) => {
      if (!ctx || !framesRef.current[index]) return;
      const img = framesRef.current[index];

      const canvasWidth  = canvas.width;
      const canvasHeight = canvas.height;
      const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
      const x = (canvasWidth  - img.width  * scale) / 2;
      const y = (canvasHeight - img.height * scale) / 2;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    const initScrollAnimation = () => {
      if (scrollTween) {
        scrollTween.scrollTrigger?.kill();
        scrollTween.kill();
      }
      // FIX #2: removed misplaced ScrollTrigger.refresh() that was here

      const totalFrames = framesRef.current.length - 1;
      const obj = { frame: 0 };

      // FIX #7: query the scroller as a DOM node so mismatches fail visibly
      const scroller = document.getElementById('main-container') ?? '#main-container';

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.1,
          markers: false,
          id: 'video-scrub',
          invalidateOnRefresh: true,
        },
      });

      tl.to(obj, {
        frame: totalFrames,
        ease: 'none',
        onUpdate: () => {
          const index = Math.round(obj.frame);
          // FIX #3: keep track of current frame for resize redraws
          currentFrameRef.current = index;
          drawFrame(index);
        },
      });

      // Parallax effects
      if (bgLightsRef.current) {
        tl.fromTo(bgLightsRef.current, { y: -50, opacity: 0.5 }, { y: 50, opacity: 0.8, ease: 'none' }, 0);
      }
      if (cageMeshRef.current) {
        tl.fromTo(cageMeshRef.current, { scale: 1.05, y: 0 }, { scale: 1.1, y: -20, ease: 'none' }, 0);
      }
      if (vignetteRef.current) {
        tl.fromTo(vignetteRef.current, { opacity: 0.3 }, { opacity: 0.6, ease: 'none' }, 0);
      }

      scrollTween = tl;
      setIsLoading(false);

      // Initial draw
      drawFrame(0);
    };

    const extractFrames = async () => {
      // FIX #6: removed console.log
      video.muted = true;
      video.pause();

      // Extract at ~15fps: 7s × 15fps ≈ 105 frames
      const fps      = 15;
      const step     = 1 / fps;
      const duration = video.duration;

      // Offscreen canvas capped at 720p for memory efficiency
      const extractHeight = 720;
      const aspectRatio   = video.videoWidth / video.videoHeight;
      const extractWidth  = extractHeight * aspectRatio;

      const offscreen = new OffscreenCanvas(extractWidth, extractHeight);
      const offCtx    = offscreen.getContext('2d');
      if (!offCtx) return;

      framesRef.current = [];

      try {
        for (let t = 0; t <= duration; t += step) {
          // FIX #1: bail out immediately if component unmounted
          if (isCancelled) return;

          video.currentTime = t;

          // FIX #5: settled flag prevents the safety-timeout from firing twice
          await new Promise((resolve) => {
            let settled = false;
            const onSeeked = () => {
              if (settled) return;
              settled = true;
              resolve();
            };
            video.addEventListener('seeked', onSeeked, { once: true });
            setTimeout(onSeeked, 200);
          });

          if (isCancelled) return; // check again after the async wait

          offCtx.drawImage(video, 0, 0, extractWidth, extractHeight);
          const bitmap = await createImageBitmap(offscreen);
          framesRef.current.push(bitmap);
        }
      } catch (e) {
        console.error('Frame extraction failed:', e);
      }

      // FIX #1: only proceed if still mounted
      // FIX #6: removed console.log
      if (!isCancelled) initScrollAnimation();
    };

    // FIX #3: redraw the current frame after resize so canvas isn't left blank
    const handleResize = () => {
      if (canvas && containerRef.current) {
        canvas.width  = containerRef.current.clientWidth;
        canvas.height = window.innerHeight;
        if (framesRef.current.length) drawFrame(currentFrameRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // initial size

    if (video.readyState >= 1) {
      extractFrames();
    } else {
      video.addEventListener('loadedmetadata', () => extractFrames(), { once: true });
    }

    return () => {
      // FIX #1: signal async loop to stop
      isCancelled = true;

      window.removeEventListener('resize', handleResize);

      if (scrollTween) {
        scrollTween.scrollTrigger?.kill();
        scrollTween.kill();
      }

      // FIX #8: guard against double-close in React Strict Mode
      framesRef.current.forEach(bmp => { try { bmp.close(); } catch (_) {} });
      framesRef.current = [];
    };

  }, { scope: containerRef, dependencies: [videoSrc] });

  return (
    <div
      ref={containerRef}
      className="hidden md:block relative w-full h-[500vh] snap-start"
      aria-label="MMA Knockout Animation Scroll Container"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-white" />
            <p className="text-sm text-zinc-400">Extracting frames for smooth playback...</p>
          </div>
        )}

        {/* Background Layer: Lights */}
        <div
          ref={bgLightsRef}
          className="absolute inset-0 z-0 opacity-50"
          style={{ background: 'radial-gradient(circle at 50% 30%, #2a2a2a 0%, #000 70%)' }}
        />

        {/* Canvas for Frame Rendering */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 z-10 h-full w-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Hidden Video for Extraction */}
        {videoSrc && (
          <video
            ref={videoRef}
            className="hidden"
            src={videoSrc}
            muted
            playsInline
            preload="auto"
          />
        )}

        {/* Parallax Layer: Cage Mesh Overlay */}
        <div
          ref={cageMeshRef}
          className="pointer-events-none absolute inset-0 z-20 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Foreground Layer: Vignette */}
        <div
          ref={vignetteRef}
          className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"
        />
      </div>
    </div>
  );
}
