"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const introTranscript = [
  "Hi, I’m Shantel Kisi.",
  "I’m a Computer Science MSc graduate.",
  "I specialise in data, AI, machine learning and software development.",
  "I enjoy turning complex, real-world problems into useful technical systems.",
  "One example is Water Support Without Barriers, a prototype for organising water letters and next steps.",
];
const introScenes = [
  { title: "Hello, I’m Shantel.", detail: "Computer scientist · curious problem solver", visual: "hello" },
  { title: "Computer Science MSc graduate", detail: "A foundation in systems, data and software", visual: "study" },
  { title: "Data · AI · software", detail: "Turning complex information into clear tools", visual: "data" },
  { title: "Built around real needs", detail: "Useful systems start by understanding people", visual: "people" },
  { title: "Water Support Without Barriers", detail: "A prototype for letters, decisions and next steps", visual: "water" },
];
const cvPath = "";
const defaultAvatarVideoUrl = "/shantel-avatar.mp4";
const defaultAvatarVisualUrl = "/shantel-avatar-transparent.webm";

const skills = [
  { symbol: "Py", name: "Python", group: "01", used: "Used to build data, machine-learning, and application prototypes." },
  { symbol: "SQL", name: "SQL", group: "02", used: "Applied relational queries and data modelling to turn records into useful analysis." },
  { symbol: "ML", name: "Machine learning", group: "03", used: "Explored environmental datasets with machine-learning techniques for decision support." },
  { symbol: "AI", name: "Artificial intelligence", group: "03", used: "Interested in practical AI applications grounded in clear user needs and data." },
  { symbol: "JS", name: "JavaScript", group: "04", used: "Used to create interactive web interfaces and browser-based product demonstrations." },
  { symbol: "Jv", name: "Java", group: "04", used: "Foundation in object-oriented programming and software development." },
  { symbol: "DB", name: "Databases", group: "02", used: "Structured data workflows and relational database concepts." },
  { symbol: "Git", name: "Git & GitHub", group: "05", used: "Version control supports traceable development and collaborative delivery." },
  { symbol: "API", name: "APIs", group: "04", used: "Understands service integration patterns and structured data exchange." },
  { symbol: "DS", name: "Data science", group: "03", used: "Combines exploration, preparation, and analysis to surface useful patterns." },
  { symbol: "Viz", name: "Data visualisation", group: "03", used: "Translates trends into clear charts, dashboards, and monitoring views." },
  { symbol: "PM", name: "Project delivery", group: "05", used: "Breaks work into clear steps and checks each result against the intended need." },
];

const projects = [
  {
    number: "01",
    category: "ACCESSIBILITY · DOCUMENTS · LOCAL-FIRST",
    title: "Water Support Without Barriers",
    description: "A local-first support organiser for water bills and letters. People can add a document or paste its text, check details and dates, save next steps, and prepare a message about a bill, service, or complaint.",
    outcome: "Working prototype · demo records are fictional; not connected to a water provider",
    stack: ["Document workflow", "On-device photo reading", "Saved next steps", "Support access"],
    className: "project-card--lime",
    mark: "01 / WATER SUPPORT",
    image: "/project-water-support.svg",
    walkthrough: "/water%20support%20app%202%20Project%20.mp4",
  },
  {
    number: "02",
    category: "DATA · MACHINE LEARNING · GEOSPATIAL",
    title: "Environmental intelligence system",
    description: "An end-to-end decision-support system to make complex environmental data easier to explore and prioritise.",
    outcome: "Research prototype · environmental data, machine learning, and geospatial analysis",
    stack: ["Python", "Machine learning", "Data analysis", "Streamlit"],
    className: "project-card--paper",
    mark: "02 / FIELD NOTES",
    image: "/project-environmental-intelligence.svg",
  },
  {
    number: "03",
    category: "SQL · DATA ENGINEERING",
    title: "From raw data to useful answers",
    description: "A data pipeline case study: organise a dataset, shape a relational model, and use SQL to surface clear insights.",
    outcome: "Data pipeline case study · relational modelling and SQL analysis",
    stack: ["SQL", "Relational design", "CTEs", "Analytics"],
    className: "project-card--blue",
    mark: "03 / DATA SYSTEMS",
    image: "/project-data-pipeline.svg",
  },
  {
    number: "04",
    category: "PYTHON · SOFTWARE ENGINEERING",
    title: "Banking & account management",
    description: "A browser-based showcase inspired by my Python banking coursework: manage fictional customer accounts, validate deposits and withdrawals, transfer demo funds, and review a live ledger and management report.",
    outcome: "Interactive portfolio simulation · all data is fictional and browser-local",
    stack: ["Python source project", "Account management", "Transactions", "Tkinter GUI"],
    className: "project-card--lavender",
    mark: "04 / APPLICATIONS",
    image: "/project-banking.svg",
    demoPath: "/banking-demo",
    walkthrough: "/banking-system-demo.mp4",
  },
  {
    number: "05",
    category: "DATA VISUALISATION · ENVIRONMENTAL MONITORING",
    title: "Storm Overflow Dashboard",
    description: "A dashboard for exploring storm overflow information through clear visual summaries and monitoring views.",
    outcome: "Dashboard demonstration · shown in two consecutive video clips",
    stack: ["Dashboard", "Data visualisation", "Environmental data", "Monitoring"],
    className: "project-card--blue",
    mark: "05 / STORM OVERFLOW",
    image: "/project-storm-overflow.svg",
    walkthrough: ["/storm%20overflow1%202026-10-20%20194151.mp4", "/storm%202%202026-10-20%20195112.mp4"],
  },
];

const achievements = [
  "ENVIRONMENTAL DATA RESEARCH",
  "MSc COMPUTER SCIENCE",
  "DATA & MACHINE LEARNING",
  "SOFTWARE DEVELOPMENT",
  "REAL-WORLD SYSTEMS",
];

const socialLinks = [
  { label: "GitHub", href: "", short: "GH" },
  { label: "LinkedIn", href: "", short: "in" },
  { label: "Email", href: "", short: "↗" },
];
const configuredSocialLinks = socialLinks.filter((link) => link.href.trim());

function ProjectWalkthrough({ src, id, title, shouldPlay, onClose, onNextDemo }: { src: string | string[]; id: string; title: string; shouldPlay: boolean; onClose: () => void; onNextDemo: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [slightlyFaster, setSlightlyFaster] = useState(true);
  const clips = Array.isArray(src) ? src : [src];
  const [clipIndex, setClipIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    if (clipIndex > 0) video.load();
    video.muted = true;
    void video.play().catch(() => undefined);
  }, [clipIndex, shouldPlay]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = slightlyFaster ? 1.35 : 1;
  }, [clipIndex, slightlyFaster]);

  return (
    <motion.div className="project-demo-overlay" id={id} role="dialog" aria-modal="true" aria-label={`${title} demonstration video`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
      <div className="walkthrough-heading">
        <div><span>SEE HOW IT WORKS{clips.length > 1 ? ` / CLIP ${clipIndex + 1} OF ${clips.length}` : ""}</span><strong>{title} demonstration</strong></div>
        <div className="walkthrough-actions"><button type="button" className="playback-speed" onClick={() => setSlightlyFaster((faster) => !faster)} aria-label={`Playback speed ${slightlyFaster ? "1.35 times" : "normal speed"}. Click to change`}>{slightlyFaster ? "1.35x" : "1x"}</button><button type="button" className="walkthrough-close" onClick={onClose}>CLOSE <span aria-hidden="true">&#215;</span></button></div>
      </div>
      <span className="walkthrough-autoplay-note">AUTOPLAY / SOUND OFF</span>
      <video ref={videoRef} className="project-walkthrough-video" controls playsInline autoPlay={shouldPlay} muted preload={shouldPlay ? "auto" : "none"} onEnded={() => {
        if (clipIndex < clips.length - 1) setClipIndex((current) => current + 1);
        else onNextDemo();
      }} onLoadedMetadata={() => {
        if (videoRef.current) videoRef.current.playbackRate = slightlyFaster ? 1.35 : 1;
      }}>
        <source src={clips[clipIndex]} type="video/mp4" />
        Your browser does not support embedded videos.
      </video>
      {clips.length > 1 && <span className="walkthrough-caption">The two Storm Overflow recordings play in sequence.</span>}
    </motion.div>
  );
}

function PortfolioReel({ avatarSlot }: { avatarSlot: ReactNode }) {
  return <div className="portfolio-showcase" aria-label="Shantel Kisi introduction"><div className="portfolio-showcase-avatar">{avatarSlot}</div></div>;
}

function ProjectDemoGallery({ onSelectProject }: { onSelectProject: (index: number) => void }) {
  const firstDemoIndex = projects.findIndex((project) => Boolean(project.walkthrough));
  return (
    <section className="demo-gallery section-shell" id="demos" aria-label="Project demonstration videos" data-theme="light">
      <div className="demo-gallery-heading"><span>THE WORK, IN MOTION</span><span>03 SYSTEM DEMONSTRATIONS</span><h2>Built to solve<br />real problems.</h2></div>
      <p className="demo-gallery-intro">Explore the systems through full-screen walkthroughs.</p>
      <button className="demo-showreel-launch" type="button" onClick={() => onSelectProject(firstDemoIndex)}><span className="demo-showreel-play" aria-hidden="true">&#9654;</span><span><small>START THE SHOWREEL</small><strong>View project demonstrations</strong></span><span className="demo-showreel-count">01 <i>/ 03</i></span></button>
    </section>
  );
}
export default function Home() {
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [playingDemoIndex, setPlayingDemoIndex] = useState<number | null>(null);
  const [projectDirection, setProjectDirection] = useState(1);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(defaultAvatarVideoUrl);
  const [avatarVisualUrl, setAvatarVisualUrl] = useState<string | null>(defaultAvatarVisualUrl);
  const [activeIntroScene, setActiveIntroScene] = useState(0);
  const [avatarIsPlaying, setAvatarIsPlaying] = useState(false);
  const [avatarHasFinished, setAvatarHasFinished] = useState(false);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroVisualRef = useRef<HTMLVideoElement>(null);
  const avatarStartedRef = useRef(false);
  const avatarStartPendingRef = useRef(false);
  const avatarFinishedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (playingDemoIndex === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPlayingDemoIndex(null);
      document.getElementById("demos")?.scrollIntoView({ behavior: shouldReduceMotion ? "instant" : "smooth" });
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [playingDemoIndex, shouldReduceMotion]);

  const moveProject = useCallback((nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(projects.length - 1, nextIndex));
    if (boundedIndex === activeProjectIndex) return;
    setProjectDirection(boundedIndex > activeProjectIndex ? 1 : -1);
    setActiveProjectIndex(boundedIndex);
  }, [activeProjectIndex]);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        scrollProgressRef.current?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, progress))})`);
        let activeTheme = "light";
        document.querySelectorAll<HTMLElement>("main > section").forEach((section) => {
          const bounds = section.getBoundingClientRect();
          const sectionProgress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
          section.style.setProperty("--section-progress", sectionProgress.toFixed(3));
          const motionFactor = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
          section.style.setProperty("--parallax-y", `${(sectionProgress - 0.5) * -52 * motionFactor}px`);
          section.style.setProperty("--parallax-x", `${(sectionProgress - 0.5) * 54 * motionFactor}px`);
          section.style.setProperty("--parallax-rotate", `${(sectionProgress - 0.5) * 18 * motionFactor}deg`);
          if (bounds.top <= window.innerHeight * 0.12 && bounds.bottom > window.innerHeight * 0.12) activeTheme = section.dataset.theme ?? "light";
        });
        document.body.classList.toggle("on-dark", activeTheme === "dark");
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const openIntroduction = () => {
    setActiveIntroScene(0);
    setVideoOpen(true);
  };

  const syncIntroScene = (video: HTMLVideoElement) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const scene = Math.min(introScenes.length - 1, Math.floor((video.currentTime / video.duration) * introScenes.length));
    setActiveIntroScene((current) => current === scene ? current : scene);
  };

  const syncAvatarClips = (audioVideo: HTMLVideoElement) => {
    const visualVideo = heroVisualRef.current;
    if (visualVideo && !audioVideo.paused && Number.isFinite(visualVideo.duration) && Math.abs(visualVideo.currentTime - audioVideo.currentTime) > 0.18) {
      visualVideo.currentTime = Math.min(audioVideo.currentTime, Math.max(0, visualVideo.duration - 0.05));
    }
    syncIntroScene(audioVideo.paused && visualVideo ? visualVideo : audioVideo);
  };

  const finishAvatarIntroduction = useCallback(() => {
    if (avatarFinishedRef.current) return;
    avatarFinishedRef.current = true;
    setAvatarIsPlaying(false);
    setAvatarHasFinished(true);
    heroVisualRef.current?.pause();
    document.getElementById("demos")?.scrollIntoView({ behavior: shouldReduceMotion ? "instant" : "smooth", block: "start" });
  }, [shouldReduceMotion]);

  const enableAvatarAudio = useCallback(async () => {
    const video = heroVideoRef.current;
    if (!video || avatarStartPendingRef.current || avatarFinishedRef.current) return;
    // Keep the original MP4's audio at full player volume. Some browsers may
    // start the video element before the visitor gesture, so reassert this on
    // every start request, including when playback is already underway.
    video.defaultMuted = false;
    video.muted = false;
    video.volume = 1;
    if (!video.paused) {
      avatarStartedRef.current = true;
      if (heroVisualRef.current?.paused) void heroVisualRef.current.play().catch(() => undefined);
      return;
    }
    avatarStartPendingRef.current = true;
    video.muted = false;
    const visualVideo = heroVisualRef.current;
    try {
      video.loop = false;
      if (visualVideo) {
        visualVideo.loop = false;
        if (visualVideo.readyState > 0) visualVideo.currentTime = 0;
      }
      if (video.readyState > 0) video.currentTime = 0;
      await video.play();
      if (visualVideo) void visualVideo.play().catch(() => undefined);
      avatarStartedRef.current = true;
    } catch {
      // Retry when the visitor first interacts; browsers may block audible autoplay.
    } finally {
      avatarStartPendingRef.current = false;
    }
  }, []);

  const handleAvatarVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    setAvatarVideoUrl((previousUrl) => {
      if (previousUrl?.startsWith("blob:")) URL.revokeObjectURL(previousUrl);
      return nextUrl;
    });
    setAvatarVisualUrl((previousUrl) => {
      if (previousUrl?.startsWith("blob:") && previousUrl !== avatarVideoUrl) URL.revokeObjectURL(previousUrl);
      return nextUrl;
    });
  };

  const closeIntroduction = () => {
    setVideoOpen(false);
  };

  const demoProjectIndexes = projects.flatMap((project, index) => project.walkthrough ? [index] : []);
  const stepDemo = () => {
    if (playingDemoIndex === null) return;
    const currentPosition = demoProjectIndexes.indexOf(playingDemoIndex);
    const nextPosition = currentPosition + 1;
    if (nextPosition >= demoProjectIndexes.length) {
      setPlayingDemoIndex(null);
      return;
    }
    const nextProjectIndex = demoProjectIndexes[nextPosition];
    setActiveProjectIndex(nextProjectIndex);
    setPlayingDemoIndex(nextProjectIndex);
  };

  return (
    <main>
      <div className="scroll-progress-track" aria-hidden="true"><div className="scroll-progress-fill" ref={scrollProgressRef} /></div>
      <motion.header className="site-header" initial={shouldReduceMotion ? false : { opacity: 0, y: -22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
        <a className="wordmark" href="#home" aria-label="Shantel Kisi — home">SK<span>®</span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#demos">Work <span>03</span></a>
          <a href="#architecture-01">Approach</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact <span className="nav-dot" /></a>
        </nav>
        <a className="header-availability" href="#contact"><span className="status-dot" /> OPEN TO OPPORTUNITIES</a>
      </motion.header>

      <section className="hero section-shell" id="home" data-theme="light">
        <div className="hero-topline"><span>SHANTEL KISI <i>·</i> PORTFOLIO</span><span>COMPUTER SCIENCE / DATA / SOFTWARE</span></div>
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> COMPUTER SCIENCE <i>·</i> DATA <i>·</i> SOFTWARE</p>
          <motion.h1 initial={shouldReduceMotion ? false : { opacity: 0, y: 24, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}>I build systems<br />for <span className="hero-serif">real life.</span></motion.h1>
          <p className="hero-intro">I&apos;m Shantel, a Computer Science MSc graduate building useful tools around real-world needs, data, and technology.</p>
        </div>
        <div className="reel-note reel-note--right" aria-hidden="true">Useful work,<br />real impact<svg viewBox="0 0 170 90"><path d="M8 5 C 100 0, 158 24, 118 76 C 104 92, 84 80, 96 66" /><path d="M88 69 L96 65 L100 75" /></svg></div>
        <PortfolioReel avatarSlot={(
          <div className="reel-avatar-slot">
            {!avatarIsPlaying && !avatarHasFinished && <button className="avatar-play-control" type="button" onClick={() => { void enableAvatarAudio(); }} aria-label="Press play to hear Shantel&apos;s introduction"><span className="avatar-play-icon" aria-hidden="true">&#9654;</span><span>PRESS PLAY TO HEAR ME</span></button>}
            <div className={`avatar-stage reel-avatar-stage avatar-stage--scene-${activeIntroScene}`} aria-label="Shantel Kisi portrait stage">
              <div className="avatar-spotlight" aria-hidden="true" />
              <div className="portrait-photo-frame">{shouldReduceMotion ? <Image src="/shantel-portrait.jpg" alt="Shantel Kisi" fill sizes="(max-width: 820px) 270px, 340px" className="reel-avatar-still" /> : <video ref={heroVisualRef} className="portrait-video" src={avatarVisualUrl ?? defaultAvatarVisualUrl} autoPlay muted loop playsInline preload="metadata" disablePictureInPicture disableRemotePlayback onTimeUpdate={() => { const visual = heroVisualRef.current; if (heroVideoRef.current?.paused && visual) syncIntroScene(visual); }} aria-label="Shantel Kisi introducing herself" />}</div>
            </div>
          </div>
        )} />
        <video ref={heroVideoRef} className="avatar-audio-source" src={avatarVideoUrl ?? defaultAvatarVideoUrl} playsInline preload="metadata" onPlay={(event) => { event.currentTarget.defaultMuted = false; event.currentTarget.muted = false; event.currentTarget.volume = 1; avatarStartedRef.current = true; setAvatarIsPlaying(true); }} onTimeUpdate={(event) => syncAvatarClips(event.currentTarget)} onLoadedMetadata={(event) => syncAvatarClips(event.currentTarget)} onEnded={finishAvatarIntroduction} aria-hidden="true" tabIndex={-1} hidden />
        <div className="hero-actions reel-hero-actions">
          <a className="button button-dark reel-primary-cta" href="#work">Explore the projects <span aria-hidden="true">&rarr;</span></a>
          <button className="button button-plain" type="button" onClick={openIntroduction}><span className="play-icon" aria-hidden="true">&#9654;</span> Meet Shantel <span className="button-time">INTRO</span></button>
          {cvPath && <a className="button button-plain cv-button" href={cvPath} download>Download CV <span aria-hidden="true">&darr;</span></a>}
        </div>
        {configuredSocialLinks.length > 0 && <div className="hero-socials reel-hero-socials" aria-label="Social links">
          {configuredSocialLinks.map((link) => <a key={link.label} href={link.href} target={link.label === "Email" ? undefined : "_blank"} rel="noreferrer">{link.label}<span aria-hidden="true">&#8599;</span></a>)}
        </div>}
        <div className="hero-bottomline"><span>CURIOUS BY NATURE. BUILDER BY PRACTICE.</span><a href="#work">SCROLL TO DISCOVER <span>&darr;</span></a></div>
      </section>

      <ProjectDemoGallery onSelectProject={(index) => {
        moveProject(index);
        setPlayingDemoIndex(index);
      }} />

      <section className={`work-section section-shell${playingDemoIndex === activeProjectIndex && projects[activeProjectIndex].walkthrough ? " work-section--demo-active" : ""}`} id="work" data-theme={playingDemoIndex === activeProjectIndex && projects[activeProjectIndex].walkthrough ? "dark" : "light"}>
        <motion.div className="section-heading section-reveal" initial={shouldReduceMotion ? false : { opacity: 0, y: 42, clipPath: "inset(0 0 30% 0)" }} whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="projects-heading"><p className="eyebrow"><span className="eyebrow-line" /> 01 / REAL WORLD CONTRIBUTION PROJECTS</p><h2>Real World<br /><span>Contribution Projects.</span></h2></div>
          <p className="heading-aside">A few problems I’ve explored —<br />and the systems behind them.</p>
        </motion.div>
        <div className="project-sequence" aria-label="Navigate featured projects">
          <div className="project-sequence-label"><span>NOW EXPLORING</span><strong><AnimatePresence mode="wait" initial={false}><motion.em key={activeProjectIndex} initial={shouldReduceMotion ? false : { opacity: 0, y: 9, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={shouldReduceMotion ? undefined : { opacity: 0, y: -9, filter: "blur(5px)" }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24 }}>0{activeProjectIndex + 1}</motion.em></AnimatePresence><i> / 0{projects.length}</i></strong><b><AnimatePresence mode="wait" initial={false}><motion.span key={projects[activeProjectIndex].title} initial={shouldReduceMotion ? false : { opacity: 0, x: 12, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={shouldReduceMotion ? undefined : { opacity: 0, x: -12, filter: "blur(4px)" }} transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24 }}>{projects[activeProjectIndex].title}</motion.span></AnimatePresence></b></div>
          <div className="project-deck-controls"><button type="button" aria-label="Previous project" onClick={() => moveProject(activeProjectIndex - 1)} disabled={activeProjectIndex === 0}>←</button><div className="project-sequence-track">{projects.map((project, index) => <button key={project.number} type="button" aria-label={`Show project ${index + 1}: ${project.title}`} aria-current={index === activeProjectIndex ? "step" : undefined} onClick={() => moveProject(index)}><span>{index === activeProjectIndex && (shouldReduceMotion ? <i /> : <motion.i layoutId="active-project-marker" />)}</span></button>)}</div><button type="button" aria-label="Next project" onClick={() => moveProject(activeProjectIndex + 1)} disabled={activeProjectIndex === projects.length - 1}>→</button></div>
        </div>
        <div className="project-list" aria-label={`Project ${activeProjectIndex + 1} of ${projects.length}: ${projects[activeProjectIndex].title}`}>
          <AnimatePresence mode="wait" initial={false}>
          {projects.map((project, index) => index === activeProjectIndex && (
            <motion.article id={`project-${project.number}`} className={`project-card ${project.className} project-card--active ${project.walkthrough ? "project-card--demo" : ""}`} data-active="true" key={project.number} initial={shouldReduceMotion ? false : { opacity: 0, y: 16, z: -280, rotateX: 14, rotateY: projectDirection > 0 ? -94 : 94, rotateZ: projectDirection > 0 ? -5 : 5, scale: 0.72, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, filter: "blur(0px)" }} exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, z: -260, rotateX: -12, rotateY: projectDirection > 0 ? 94 : -94, rotateZ: projectDirection > 0 ? 5 : -5, scale: 0.72, filter: "blur(12px)" }} transition={{ duration: shouldReduceMotion ? 0 : 0.42, ease: [0.7, 0, 0.3, 1] }} onPointerMove={(event) => {
              if (event.pointerType === "touch") return;
              const bounds = event.currentTarget.getBoundingClientRect();
              const x = event.clientX - bounds.left;
              const y = event.clientY - bounds.top;
              const tiltX = ((y / bounds.height) - 0.5) * -2.8;
              const tiltY = ((x / bounds.width) - 0.5) * 2.8;
              event.currentTarget.style.setProperty("--pointer-x", `${x}px`);
              event.currentTarget.style.setProperty("--pointer-y", `${y}px`);
              event.currentTarget.style.setProperty("--tilt-x", `${tiltX}deg`);
              event.currentTarget.style.setProperty("--tilt-y", `${tiltY}deg`);
            }} onPointerLeave={(event) => {
              event.currentTarget.style.removeProperty("--pointer-x");
              event.currentTarget.style.removeProperty("--pointer-y");
              event.currentTarget.style.removeProperty("--tilt-x");
              event.currentTarget.style.removeProperty("--tilt-y");
            }} whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.006 }} style={{ transformPerspective: 1500, transformOrigin: "center center" }}>
              <div className="project-visual"><span className="project-index">{project.title}</span><div className="project-art-wrap"><motion.div className="project-art-entrance" initial={shouldReduceMotion ? false : { scale: 0.78, rotate: index % 2 === 0 ? -5 : 5, rotateX: 10, z: -90, y: 34 }} whileInView={{ scale: 1, rotate: 0, rotateX: 0, z: 0, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.15, delay: 0.12 + (index % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}><Image className="project-art" src={project.image} alt={`${project.title} project illustration`} width={640} height={440} /></motion.div></div>{project.walkthrough && <span className="project-simple-arrow" aria-hidden="true">➜</span>}<span className="project-visual-foot">PROJECT {project.number} <span aria-hidden="true">·</span> SYSTEM OVERVIEW</span></div>
              <div className="project-details"><div className="project-story"><p className="project-category">{project.category}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p><div className="project-stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div><div className="project-outcome">{project.outcome}</div>{project.walkthrough && <button className="text-link" type="button" onClick={() => setPlayingDemoIndex(index)}>Watch demonstration</button>}{project.demoPath ? <Link className="text-link" href={project.demoPath}>Open interactive demo</Link> : !project.walkthrough && <button className="text-link" type="button" onClick={() => document.getElementById("architecture-01")?.scrollIntoView({ behavior: shouldReduceMotion ? "instant" : "smooth" })}>Explore the approach</button>}</div></div>
            </motion.article>
          ))}
          </AnimatePresence>
        </div>
        <div className="project-deck-footer"><span>PROJECT {String(activeProjectIndex + 1).padStart(2, "0")} OF {String(projects.length).padStart(2, "0")}</span><button type="button" onClick={() => moveProject(activeProjectIndex + 1)} disabled={activeProjectIndex === projects.length - 1}>NEXT PROJECT <span aria-hidden="true">→</span></button></div>
        <p className="project-disclaimer"><span>✳</span> The Water Support walkthrough shows the prototype in action. The banking demo uses fictional data saved only in this browser; it is a portfolio simulation, not a financial service. Share only publication-safe details.</p>
      </section>

      <AnimatePresence>
        {playingDemoIndex !== null && projects[playingDemoIndex]?.walkthrough && <ProjectWalkthrough key={projects[playingDemoIndex].number} src={projects[playingDemoIndex].walkthrough} id={`project-walkthrough-${projects[playingDemoIndex].number}`} title={projects[playingDemoIndex].title} shouldPlay onNextDemo={stepDemo} onClose={() => { setPlayingDemoIndex(null); document.getElementById("demos")?.scrollIntoView({ behavior: shouldReduceMotion ? "instant" : "smooth" }); }} />}
      </AnimatePresence>

      <motion.section className="skills-section" id="skills" data-theme="dark" initial={shouldReduceMotion ? false : { opacity: 0, y: 70 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="section-shell skills-shell">
          <div className="section-heading skills-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> 02 / THE TOOLKIT</p><h2>Skills, with<br /><span>context.</span></h2></div><p className="heading-aside">A skill means more when<br />you can show where it lives.</p></div>
          <div className="skills-layout">
            <div className="periodic-grid" aria-label="Interactive skills. Select an element to see its project context.">
              {skills.map((skill, index) => <motion.button type="button" key={skill.symbol} className={`skill-element ${selectedSkill.symbol === skill.symbol ? "is-selected" : ""}`} onClick={() => setSelectedSkill(skill)} aria-pressed={selectedSkill.symbol === skill.symbol} aria-label={`${skill.name}: show experience context`} initial={shouldReduceMotion ? false : { opacity: 0, y: 26, scale: 0.92 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.45, delay: index * 0.035 }} whileHover={shouldReduceMotion ? undefined : { y: -7, z: 20, rotateX: 6, rotateY: -4, scale: 1.055 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }} style={{ transformPerspective: 700 }}><span className="skill-group">{skill.group}</span><span className="skill-symbol">{skill.symbol}</span><span className="skill-name">{skill.name}</span></motion.button>)}
            </div>
            <AnimatePresence mode="wait">
              <motion.aside className="skill-detail" key={selectedSkill.symbol} initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.96, rotateX: 3 }} animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }} exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }} transition={{ type: "spring", stiffness: 190, damping: 23 }} aria-live="polite">
                <span className="detail-overline">ELEMENT {selectedSkill.group} · SELECTED</span><span className="detail-symbol">{selectedSkill.symbol}</span><h3>{selectedSkill.name}</h3><p>{selectedSkill.used}</p><span className="detail-hint">SELECT ANOTHER ELEMENT ↗</span>
              </motion.aside>
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      <motion.section className="architecture-section section-shell" id="architecture-01" data-theme="light" initial={shouldReduceMotion ? false : { opacity: 0, y: 64 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="section-kicker"><span>03 / HOW I THINK ABOUT SYSTEMS</span><span>FROM QUESTION TO OUTCOME</span></div>
        <div className="architecture-heading"><h2>Make the complex<br /><span>make sense.</span></h2><p>Good engineering connects the need, the data, and the person using the result. I approach each project by validating the problem, shaping its logic, and making the outcome clear to use.</p></div>
        <div className="architecture-flow" aria-label="Example project architecture from a user problem to a useful result">
          {["Real-world question", "Data & validation", "Model / logic", "Useful interface", "Measured outcome"].map((step, index) => <motion.div className="architecture-step" key={step} initial={shouldReduceMotion ? false : { opacity: 0, x: 34, scale: 0.97 }} whileInView={{ opacity: 1, x: 0, scale: 1 }} whileHover={shouldReduceMotion ? undefined : { y: -7, z: 24, rotateX: -5, scale: 1.035 }} viewport={{ once: true, amount: 0.65 }} transition={{ duration: 0.6, delay: index * 0.11, ease: [0.16, 1, 0.3, 1] }} style={{ transformPerspective: 700 }}><span>0{index + 1}</span><strong>{step}</strong>{index < 4 && <i aria-hidden="true">→</i>}</motion.div>)}
        </div>
      </motion.section>

      <motion.section className="lab-section" id="lab" data-theme="dark" initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>
        <div className="section-shell lab-layout">
          <div><p className="eyebrow"><span className="eyebrow-line" /> 04 / STILL EXPERIMENTING</p><h2>The<br /><span>experimental</span><br />lab.</h2></div>
          <div className="lab-content"><div className="lab-badge"><span className="status-dot" /> PROTOTYPES, NOT PROMISES</div><p>Some ideas are still taking shape. This is where accessibility experiments, early concepts, and lessons from the build belong — labelled honestly, and shared when they’re ready.</p><a className="text-link" href="#contact">Have a problem worth exploring? <span>↗</span></a><div className="lab-note"><span>IDEA Nº 001</span><span>MAKE INFORMATION EASIER TO ACT ON</span><span>IN PROGRESS ◌</span></div></div>
        </div>
      </motion.section>

      <div className="ticker" aria-label="Highlights: environmental data research, MSc Computer Science, data, AI, software development">
        <div className="ticker-track" aria-hidden="true">{[...achievements, ...achievements].map((item, index) => <span className="ticker-item" key={`${item}-${index}`}>{item}<i>✳</i></span>)}</div>
      </div>

      <motion.section className="contact-section section-shell" id="contact" initial={shouldReduceMotion ? false : { opacity: 0, y: 55 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="contact-top"><span>05 / LET’S MAKE SOMETHING USEFUL</span><span>GOOD PEOPLE. INTERESTING PROBLEMS.</span></div>
        <h2>Let’s talk<br /><span>about what’s next.</span></h2>
        <div className="contact-bottom"><p>Looking for a curious, hands-on teammate?<br />I’d love to hear what you’re building.</p>{configuredSocialLinks.length > 0 && <div className="contact-links">{configuredSocialLinks.map((link) => <a key={link.label} href={link.href} target={link.label === "Email" ? undefined : "_blank"} rel="noreferrer">{link.label} <span>↗</span></a>)}</div>}</div>
      </motion.section>

      <footer className="site-footer"><a className="wordmark" href="#home">SK<span>®</span></a><span>DESIGNED TO BE EXPLORED · BUILT WITH CARE</span><a href="#home">BACK TO TOP ↑</a></footer>

      <AnimatePresence>
        {videoOpen && <motion.div className="modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeIntroduction}><motion.div className="intro-modal intro-modal--video" role="dialog" aria-modal="true" aria-labelledby="video-title" tabIndex={-1} initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Escape") closeIntroduction(); }}>
          <button className="modal-close" type="button" autoFocus onClick={closeIntroduction} aria-label="Close introduction">×</button>
          <span className="modal-label">MEET SHANTEL · A VISUAL INTRODUCTION</span>
          <h2 id="video-title">A little more<br />about me.</h2>
          <div className="intro-story-player">
            <div className="intro-story-portrait">
              {avatarVideoUrl ? <video ref={introVideoRef} className="avatar-video-preview" controls playsInline preload="metadata" src={avatarVideoUrl} onTimeUpdate={(event) => syncIntroScene(event.currentTarget)}><track kind="captions" /></video> : <div className="avatar-reference-frame"><Image src="/avatar.jpg" alt="Shantel Kisi standing in a professional office outfit" fill sizes="(max-width: 650px) 90vw, 640px" priority /><span className="avatar-reference-label"><i /> FULL-BODY PORTRAIT · YOUR IMAGE</span></div>}
              <span className="story-video-label"><i /> PORTRAIT FILM</span>
            </div>
            <div className={`intro-story-visual intro-story-visual--${introScenes[activeIntroScene].visual}`} aria-live="polite">
              <span className="story-scene-count">SCENE 0{activeIntroScene + 1} <i /> 05</span>
              <div className="story-graphic" aria-hidden="true"><span className="graphic-orbit graphic-orbit-a"/><span className="graphic-orbit graphic-orbit-b"/><span className="graphic-core">{["SK", "MSc", "AI", "◎", "↗"][activeIntroScene]}</span><i className="graphic-spark graphic-spark-a"/><i className="graphic-spark graphic-spark-b"/><i className="graphic-spark graphic-spark-c"/></div>
              <div className="story-caption"><span>SHANTEL KISI · COMPUTER SCIENCE</span><h3>{introScenes[activeIntroScene].title}</h3><p>{introScenes[activeIntroScene].detail}</p></div>
              <div className="story-progress" aria-label={`Introduction scene ${activeIntroScene + 1} of ${introScenes.length}`}>{introScenes.map((scene, index) => <button key={scene.visual} type="button" aria-label={`Show scene ${index + 1}: ${scene.title}`} aria-current={index === activeIntroScene ? "step" : undefined} onClick={() => setActiveIntroScene(index)} />)}</div>
            </div>
          </div>
          <div className="intro-story-controls"><span>Original avatar audio · scene illustrations follow the video.</span></div>
          <div className="avatar-video-action"><p>Choose a different portrait video if you want to refresh the motion. The visual scenes are designed to sit beside the footage.</p><label className="button button-plain video-upload-button">Choose a different intro video<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleAvatarVideo} /></label></div>
          <div className="avatar-transcript"><span>INTRO SCRIPT</span><p>{introTranscript.map((line, index) => <span className={activeIntroScene === index ? "is-speaking-line" : ""} key={line}>{line} </span>)}</p></div>
        </motion.div></motion.div>}
      </AnimatePresence>
    </main>
  );
}
