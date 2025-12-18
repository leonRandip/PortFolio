import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function VideoScrub() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bgLightsRef = useRef(null);
  const cageMeshRef = useRef(null);
  const vignetteRef = useRef(null);

  const [videoSrc, setVideoSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const framesRef = useRef([]);

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
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !videoSrc || !canvas) return;

    const ctx = canvas.getContext('2d');
    let scrollTween = null;

    // Helper to draw a frame maintaining aspect ratio (object-cover)
    const drawFrame = (index) => {
        if (!ctx || !framesRef.current[index]) return;
        const img = framesRef.current[index];
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // Calculate scaling to cover
        const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const x = (canvasWidth - imgWidth * scale) / 2;
        const y = (canvasHeight - imgHeight * scale) / 2;
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
    };

    const initScrollAnimation = () => {
        if (scrollTween) {
            scrollTween.scrollTrigger?.kill();
            scrollTween.kill();
        }
        ScrollTrigger.refresh();

        const totalFrames = framesRef.current.length - 1;
        const obj = { frame: 0 };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            scroller: '#main-container',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.1, // Very responsive scrub since we are just swapping images
            // pin: true, // Removed pin, using CSS sticky instead
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
                drawFrame(index);
            }
        });

        // Parallax Effects
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
        console.log('Starting frame extraction...');
        video.muted = true;
        video.pause();
        
        // Extract at ~15fps to keep memory usage reasonable while maintaining smoothness
        // 7s * 15fps = ~105 frames. 
        const fps = 15;
        const step = 1 / fps;
        const duration = video.duration;
        
        // Use an offscreen canvas for extraction to avoid flicker
        // Limit resolution to 720p height for performance/memory
        const extractHeight = 720; 
        const aspectRatio = video.videoWidth / video.videoHeight;
        const extractWidth = extractHeight * aspectRatio;
        
        const offscreen = new OffscreenCanvas(extractWidth, extractHeight);
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        framesRef.current = []; // Clear previous

        try {
            for (let t = 0; t <= duration; t += step) {
                video.currentTime = t;
                await new Promise((resolve) => {
                    const onSeeked = () => {
                        video.removeEventListener('seeked', onSeeked);
                        resolve();
                    };
                    video.addEventListener('seeked', onSeeked, { once: true });
                    // Safety timeout
                    setTimeout(onSeeked, 200); 
                });
                
                // Draw to offscreen canvas
                offCtx.drawImage(video, 0, 0, extractWidth, extractHeight);
                // Create ImageBitmap (highly efficient)
                const bitmap = await createImageBitmap(offscreen);
                framesRef.current.push(bitmap);
            }
        } catch (e) {
            console.error("Frame extraction failed:", e);
        }
        
        console.log(`Extracted ${framesRef.current.length} frames.`);
        initScrollAnimation();
    };

    // Resize handler for canvas
    const handleResize = () => {
        if (canvas && containerRef.current) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = window.innerHeight; // Use window height for sticky container
            // Redraw current frame if animation is active (handled by GSAP usually, but good for safety)
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    if (video.readyState >= 1) {
        extractFrames();
    } else {
        video.addEventListener('loadedmetadata', () => extractFrames(), { once: true });
    }

    return () => {
        window.removeEventListener('resize', handleResize);
        if (scrollTween) {
            scrollTween.scrollTrigger?.kill();
            scrollTween.kill();
        }
        // Cleanup bitmaps
        framesRef.current.forEach(bmp => bmp.close());
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
          style={{
            background: 'radial-gradient(circle at 50% 30%, #2a2a2a 0%, #000 70%)',
          }}
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
