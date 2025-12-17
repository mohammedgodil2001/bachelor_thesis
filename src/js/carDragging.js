import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import revealSoundSrc from '../soundaffects/ui-alert-menu-modern-interface-deny-small-230476.mp3';

const revealAudio = new Audio(revealSoundSrc);

// Import Video Assets (Fixes 404s)
import mainVideoUrl from '../images/car_dragging.mp4';
import sedanVideoUrl from '../images/sedan_transition1371-1412.mp4';
import suvVideoUrl from '../images/SUV_transition1371-1411.mp4';

// --- Configuration & State ---

const CONFIG = {
    START_TIME: 2,
    STOP_TIME: 5,
    END_TIME: 10,
    STOP_POINT_PERCENT: 0.5,
    SNAP_THRESHOLD: 0.01,
    RADIUS: 260.13,
    START_ANGLE: 0,
    END_ANGLE: -Math.PI / 2,
    SOURCES: {
        MAIN: mainVideoUrl,
        SEDAN: sedanVideoUrl,
        SUV: suvVideoUrl
    }
};

const state = {
    blobs: {
        MAIN: null,
        SEDAN: null,
        SUV: null
    },
    activeSourceKey: 'MAIN',
    isDragging: false,
    phasesUnlocked: 0,
    currentDragLimit: 0.5,
    currentDragMin: 0.0,
    currentScrollMode: 'SEDAN',
    containerRect: { left: 0, top: 0 },
    currentThumbState: 1,
    currentThumbState: 1,
    currentPercent: 0,
    currentPopup: 'NONE', // Track active popup: 'INTRO' or 'NONE'
    currentScrollProgress: 0,
    isInstructionVisible: false, // New flag to track instruction popup state
    sceneActive: false // Prevents premature animation during preload
};

// --- DOM Elements (Populated in init) ---
let container, mainVideo, track, thumb, scrollContainer, sliderContainer;
let textIntro, instructionPopup;

// --- Helper Functions ---

const updateDimensions = () => {
    if (!track) return;
    const rect = track.getBoundingClientRect();
    state.containerRect = { left: rect.left, top: rect.top };
};

const animateText = (element) => {
    if (!element) return;
    
    // Reset container opacity
    gsap.set(element, { autoAlpha: 1 });
    
    // Find chars (created by SplitType in main.js)
    const chars = element.querySelectorAll('.char');
    if (chars.length > 0) {
        gsap.fromTo(chars, 
            { opacity: 0, y: 8 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.03, // Matched to main.js CONFIG.animation.charDuration
                stagger: 0.015, // Matched to main.js CONFIG.animation.charStagger
                ease: "power1.out",
                overwrite: 'auto',
                onStart: () => {
                    const audioToggle = document.querySelector('.audio-toggle');
                    // Check if loading is active
                    if (window.isLoading) return;

                    if (audioToggle && audioToggle.getAttribute('aria-pressed') === 'true') {
                        revealAudio.currentTime = 0;
                        revealAudio.play().catch(() => {});
                    }
                }
            }
        );
    }
};

const hideText = (element) => {
    if (!element) return;
    gsap.to(element, { 
        autoAlpha: 0, 
        duration: 0.3, 
        overwrite: 'auto' 
    });
};

const updateActionHint = (text) => {
    const el = document.querySelector('.scroll-text-svg');
    if (el) el.textContent = text;
};

const updatePopups = (percent) => {
    let targetPopup = 'NONE';

    // Show popup if on MAIN dragging scene (but not scrolling out) OR if scrolling is in early stage (< 50%)
    const isInteractive = state.activeSourceKey === 'MAIN' && state.currentScrollMode !== 'MAIN_END';
    const isVisible = isInteractive || state.currentScrollProgress < 0.5;

    if (isVisible) {
        targetPopup = 'INTRO';
    }

    // Only update if changed
    if (targetPopup !== state.currentPopup) {
        // Hide previous
        if (state.currentPopup === 'INTRO') hideText(textIntro);

        // Show new
        if (targetPopup === 'INTRO') animateText(textIntro);

        state.currentPopup = targetPopup;
    }
    
    // Instruction Popup Logic (Independent)
    if (instructionPopup) {
        // Show instruction if interactive, NOT dragging, near start, AND scene is active (entered)
        const shouldShowInstruction = isInteractive && !state.isDragging && percent < 0.05 && state.sceneActive;

        if (shouldShowInstruction) {
             if (!state.isInstructionVisible) {
                 animateText(instructionPopup);
                 state.isInstructionVisible = true;
             }
        } else {
             if (state.isInstructionVisible) {
                 hideText(instructionPopup);
                 state.isInstructionVisible = false;
             }
        }
    }
};



const updateThumbIcon = (percent) => {
    let newState = 1;
    if (percent >= 1.0 - 0.01) newState = 3;
    else if (Math.abs(percent - 0.5) <= CONFIG.SNAP_THRESHOLD) newState = 2;
    else if (percent > 0.5 + CONFIG.SNAP_THRESHOLD) newState = 2;
    else newState = 1;

    if (newState !== state.currentThumbState) {
        state.currentThumbState = newState;
        if (thumb) {
            thumb.classList.remove('thumb-diamond', 'thumb-square', 'thumb-final');
            if (newState === 1) thumb.classList.add('thumb-diamond');
            else if (newState === 2) thumb.classList.add('thumb-square');
            else if (newState === 3) thumb.classList.add('thumb-final');
        }
    }
};

const updateThumbPosition = (percent) => {
    const angle = CONFIG.START_ANGLE + (percent * (CONFIG.END_ANGLE - CONFIG.START_ANGLE));
    const cx = 15.17;
    const cy = 260.13;
    const r = CONFIG.RADIUS;

    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    // USE GSAP for smooth movement
    if (thumb) {
        gsap.to(thumb, {
            left: x,
            top: y,
            duration: 0.1, // Slight delay for smoothness
            ease: "power2.out",
            overwrite: "auto"
        });
    }

    updateThumbIcon(percent);
};

const enableScroll = (mode) => {
    // Skip if programmatic navigation is active to avoid scroll conflicts
    if (window.isNavigating) return;

    state.currentScrollMode = mode;
    if (mode === 'NONE') {
        document.body.style.overflowY = 'hidden';
        if (scrollContainer) scrollContainer.style.display = 'none';
    } else {
        document.body.style.overflowY = 'auto';
        if (scrollContainer) scrollContainer.style.display = 'block';
        
        // Refresh ScrollTrigger when availability changes
        ScrollTrigger.refresh();
    }
};

const switchToVideo = (key) => {
    if (state.activeSourceKey === key) return;

    const url = state.blobs[key] || CONFIG.SOURCES[key];
    if (mainVideo) {
        mainVideo.pause();
        mainVideo.src = url;
        state.activeSourceKey = key;
        mainVideo.pause(); 
    }
    
    // Update popups whenever video source changes (e.g. scrolling hides text)
    updatePopups(state.currentPercent);
};

const updateUI = (percent) => {
    updateThumbPosition(percent);
    updatePopups(percent); // Update popups

    let targetTime;
    if (percent <= CONFIG.STOP_POINT_PERCENT) {
        const p = percent / CONFIG.STOP_POINT_PERCENT;
        targetTime = CONFIG.START_TIME + (p * (CONFIG.STOP_TIME - CONFIG.START_TIME));
    } else {
        const p = (percent - CONFIG.STOP_POINT_PERCENT) / (1.0 - CONFIG.STOP_POINT_PERCENT);
        targetTime = CONFIG.STOP_TIME + (p * (CONFIG.END_TIME - CONFIG.STOP_TIME));
    }

    if (state.activeSourceKey === 'MAIN' && mainVideo) {
        mainVideo.currentTime = targetTime;
    }
};

const getPercentFromXY = (clientX, clientY) => {
    const globalCx = state.containerRect.left + 15.17;
    const globalCy = state.containerRect.top + 260.13;

    const dx = clientX - globalCx;
    const dy = clientY - globalCy;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 50) return null;

    let angle = Math.atan2(dy, dx);

    if (angle > 0.1) angle = 0;
    if (angle < -Math.PI) angle = -Math.PI;

    const minAng = Math.min(CONFIG.START_ANGLE, CONFIG.END_ANGLE);
    const maxAng = Math.max(CONFIG.START_ANGLE, CONFIG.END_ANGLE);
    angle = Math.max(minAng, Math.min(maxAng, angle));

    return (angle - CONFIG.START_ANGLE) / (CONFIG.END_ANGLE - CONFIG.START_ANGLE);
};

const checkScrollUnlock = () => {
    // Adjust unlocking logic based on progress
    if (Math.abs(state.currentPercent - CONFIG.STOP_POINT_PERCENT) < 0.01) {
        enableScroll('SUV'); 
    } else if (state.currentPercent >= 0.99) {
        enableScroll('MAIN_END');
    } else if (state.currentPercent < 0.02) {
        enableScroll('SEDAN');
    } else {
        enableScroll('NONE');
    }
};

const preloadVideos = async () => {
    try {
        const [p1, p2, p3] = await Promise.all([
            fetch(CONFIG.SOURCES.MAIN).then(r => r.blob()),
            fetch(CONFIG.SOURCES.SEDAN).then(r => r.blob()),
            fetch(CONFIG.SOURCES.SUV).then(r => r.blob())
        ]);

        state.blobs.MAIN = URL.createObjectURL(p1);
        state.blobs.SEDAN = URL.createObjectURL(p2);
        state.blobs.SUV = URL.createObjectURL(p3);

        if (mainVideo && mainVideo.src !== state.blobs.MAIN) {
            mainVideo.src = state.blobs.MAIN;
        }

        if (mainVideo) mainVideo.play().catch(() => {});
        enableScroll('SEDAN');
        updateThumbPosition(0);
        updatePopups(0); // Ensure intro text is visible

    } catch (e) {
        console.error("Error loading videos:", e);
        state.blobs.MAIN = CONFIG.SOURCES.MAIN;
        state.blobs.SEDAN = CONFIG.SOURCES.SEDAN;
        state.blobs.SUV = CONFIG.SOURCES.SUV;
    }
};

// --- Event Handlers ---

const handleDrag = (e) => {
    let percent = getPercentFromXY(e.clientX, e.clientY);
    if (percent === null) return;

    percent = Math.max(state.currentDragMin, Math.min(state.currentDragLimit, percent));

    if (Math.abs(percent - CONFIG.STOP_POINT_PERCENT) < CONFIG.SNAP_THRESHOLD) {
        percent = CONFIG.STOP_POINT_PERCENT;
    }
    if (percent > 1.0 - 0.01) {
        percent = 1.0;
    }

    state.currentPercent = percent;

    if (state.phasesUnlocked === 0 && percent >= CONFIG.STOP_POINT_PERCENT) {
        state.phasesUnlocked = 1;
    }

    if (state.phasesUnlocked === 1 && percent < 0.02) {
        state.phasesUnlocked = 0;
    }

    updateUI(percent);
};

const onPointerDown = (e) => {
    updateDimensions();
    const startPercent = getPercentFromXY(e.clientX, e.clientY);
    if (startPercent === null) return;

    enableScroll('NONE');
    updateActionHint('SCROLL');

    switchToVideo('MAIN');
    if (mainVideo) mainVideo.pause();

    state.isDragging = true;
    if (track) track.setPointerCapture(e.pointerId);
    
    // Hide instruction popup immediately
    if (instructionPopup) hideText(instructionPopup);

    if (state.phasesUnlocked === 0) {
        state.currentDragLimit = CONFIG.STOP_POINT_PERCENT;
        state.currentDragMin = 0.0;
    } else {
        state.currentDragLimit = 1.0;
        if (startPercent > CONFIG.STOP_POINT_PERCENT + 0.01) {
            state.currentDragMin = CONFIG.STOP_POINT_PERCENT;
        } else {
            state.currentDragMin = 0.0;
        }
    }

    handleDrag(e);
};

const onPointerMove = (e) => {
    if (!state.isDragging) return;
    handleDrag(e);
};

const onPointerUp = (e) => {
    state.isDragging = false;
    updateActionHint('DRAG');
    if (track) track.releasePointerCapture(e.pointerId);
    checkScrollUnlock();
};

const onTimeUpdate = () => {
    if (state.activeSourceKey === 'MAIN' && !state.isDragging && state.phasesUnlocked === 0) {
        if (mainVideo && mainVideo.currentTime >= CONFIG.START_TIME) {
            mainVideo.pause();
            mainVideo.currentTime = CONFIG.START_TIME;
        }
    }
};

const onResize = () => {
    updateDimensions();
};

const handleScrollUpdate = (self) => {
    const progress = self.progress;
    state.currentScrollProgress = progress; // Update state

    // UI Visibility Logic
    if (progress > 0.05) {
        if (sliderContainer) sliderContainer.classList.add('hide-ui');
    } else {
        if (sliderContainer) sliderContainer.classList.remove('hide-ui');
    }
    
    // If scrolled back to start, restore MAIN dragging state
    if (progress < 0.001) {
        switchToVideo('MAIN');
        updateUI(state.currentPercent);
        return;
    }
    
    // Force popup update to handle 50% fade out logic
    updatePopups(state.currentPercent);
    
    if (state.currentScrollMode === 'SEDAN') {
        switchToVideo('SEDAN');
        if (mainVideo && mainVideo.duration) {
            mainVideo.currentTime = progress * mainVideo.duration;
        }
    } else if (state.currentScrollMode === 'SUV') {
        switchToVideo('SUV');
        if (mainVideo && mainVideo.duration) {
            mainVideo.currentTime = progress * mainVideo.duration;
        }
    } else if (state.currentScrollMode === 'MAIN_END') {
        switchToVideo('MAIN');
        const dur = (mainVideo && mainVideo.duration) || 15;
        if (mainVideo) mainVideo.currentTime = CONFIG.END_TIME + (progress * (dur - CONFIG.END_TIME));
    }
};

// --- Main Init Function ---

export const initCarDraggingScene = () => {
    // 1. DOM Selection
    container = document.querySelector('#car-dragging-scene');
    mainVideo = document.getElementById('main-video'); 
    track = document.getElementById('figma-track');
    thumb = document.getElementById('figma-thumb');
    scrollContainer = document.getElementById('drag-scroll-container');
    sliderContainer = document.querySelector('.figma-slider-container');
    textIntro = document.getElementById('car-text-intro');
    instructionPopup = document.getElementById('car-drag-popup');
    
    // Initialize SplitType for text animations
    const initSplitType = (el) => {
        if (!el) return;
        const span = el.querySelector('span'); // Assuming standard structure
        if (span) {
            const split = new SplitType(span, { types: 'words, chars' });
            gsap.set(split.chars, { opacity: 0, y: 8 });
        }
    };

    if (textIntro) initSplitType(textIntro);
    
    // Init instruction popup specific structure (.popup-part-text span)
    if (instructionPopup) {
         const span = instructionPopup.querySelector('.popup-part-text span');
         if (span) {
             const split = new SplitType(span, { types: 'words, chars' });
             gsap.set(split.chars, { opacity: 0, y: 8 });
         }
    }

    // 2. Setup Listeners
    window.addEventListener('resize', onResize);
    
    // Custom Cursor Logic
    const customCursor = document.querySelector('.custom-cursor');
    const onTrackEnter = () => customCursor && customCursor.classList.add('hovered');
    const onTrackLeave = () => customCursor && customCursor.classList.remove('hovered');

    if (track) {
        track.addEventListener('pointerdown', onPointerDown);
        track.addEventListener('pointermove', onPointerMove);
        track.addEventListener('pointerup', onPointerUp);
        // Custom cursor interaction
        track.addEventListener('mouseenter', onTrackEnter);
        track.addEventListener('mouseleave', onTrackLeave);
    }
    if (mainVideo) {
        mainVideo.addEventListener('timeupdate', onTimeUpdate);
    }

    // 3. Initial Calls
    updateDimensions();
    preloadVideos();
    
    // 4. GSAP Setup
    ScrollTrigger.create({
        trigger: "#drag-scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        id: 'car-dragging-trigger',
        onUpdate: handleScrollUpdate
    });


    gsap.fromTo(container, 
        { autoAlpha: 0 },
        { 
            autoAlpha: 1, 
            duration: 0.5,
            pointerEvents: 'auto',
            scrollTrigger: {
                trigger: "#drag-scroll-container",
                start: "top bottom", 
                end: "top top", 
                scrub: true,
                onEnter: () => {
                    if (ScrollTrigger.isRefreshing) return;
                    console.log('CarDragging: onEnter fired');
                    if (mainVideo) {
                        mainVideo.currentTime = 0;
                        mainVideo.play().catch(e => console.log("Auto-play failed", e));
                    }
                    state.currentPopup = 'NONE';
                    
                    // Activates scene logic
                    state.sceneActive = true; 
                    state.isInstructionVisible = false; // Reset to ensure animation plays on entry
                    
                    updatePopups(0); 
                    updateActionHint('DRAG');
                },
                onLeave: () => {
                    if (ScrollTrigger.isRefreshing) return;
                    console.log('CarDragging: onLeave fired');
                    updateActionHint('SCROLL');
                },
                onEnterBack: () => {
                    if (ScrollTrigger.isRefreshing) return;
                    console.log('CarDragging: onEnterBack fired');
                    updateActionHint('DRAG');
                    
                    // Re-activate scene
                    state.sceneActive = true;
                    state.isInstructionVisible = false; // Reset to ensure animation plays on re-entry
                    
                    updatePopups(0);
                },
                onLeaveBack: () => {
                     if (ScrollTrigger.isRefreshing) return;
                     console.log('CarDragging: onLeaveBack fired');
                     if (mainVideo) {
                         mainVideo.pause();
                         mainVideo.currentTime = 0;
                         switchToVideo('MAIN');
                     }
                     
                     // Reset State
                     state.phasesUnlocked = 0;
                     state.currentPercent = 0;
                     state.activeSourceKey = 'MAIN';
                     state.currentScrollMode = 'SEDAN';
                     state.isDragging = false;
                     state.currentPopup = 'NONE';
                     
                     state.sceneActive = false; // Deactivate scene
                     state.isInstructionVisible = false;
                     
                     // Reset UI
                     updateThumbPosition(0);
                     updatePopups(0); // Reset popups
                     updateActionHint('SCROLL');
                     if (sliderContainer) sliderContainer.classList.remove('hide-ui');
                     enableScroll('SEDAN');
                }
            }
        }
    );
};
