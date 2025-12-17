import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import revealSoundSrc from '../soundaffects/ui-alert-menu-modern-interface-deny-small-230476.mp3';

const revealAudio = new Audio(revealSoundSrc);


import mainVideoUrl from '../images/car_dragging.mp4';
import sedanVideoUrl from '../images/sedan_transition1371-1412.mp4';
import suvVideoUrl from '../images/SUV_transition1371-1411.mp4';


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
    currentPopup: 'NONE', 
    currentScrollProgress: 0,
    isInstructionVisible: false, 
    sceneActive: false 
};

let container, mainVideo, track, thumb, scrollContainer, sliderContainer;
let textIntro, instructionPopup;


const updateDimensions = () => {
    if (!track) return;
    const rect = track.getBoundingClientRect();
    state.containerRect = { left: rect.left, top: rect.top };
};

const animateText = (element) => {
    if (!element) return;
    
    gsap.set(element, { autoAlpha: 1 });
    
    const chars = element.querySelectorAll('.char');
    if (chars.length > 0) {
        gsap.fromTo(chars, 
            { opacity: 0, y: 8 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.03, 
                stagger: 0.015, 
                ease: "power1.out",
                overwrite: 'auto',
                onStart: () => {
                    const audioToggle = document.querySelector('.audio-toggle');
                    if (window.isLoading) return;

                    if (audioToggle && audioToggle.getAttribute('aria-pressed') === 'true' && !window.isNavigating) {
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
    const isInteractive = state.activeSourceKey === 'MAIN' && state.currentScrollMode !== 'MAIN_END';
    const isVisible = isInteractive || state.currentScrollProgress < 0.5;

    if (isVisible) {
        targetPopup = 'INTRO';
    }

    if (targetPopup !== state.currentPopup) {
        if (state.currentPopup === 'INTRO') hideText(textIntro);

        if (targetPopup === 'INTRO') animateText(textIntro);

        state.currentPopup = targetPopup;
    }
    
    if (instructionPopup) {
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

    if (thumb) {
        gsap.to(thumb, {
            left: x,
            top: y,
            duration: 0.1, 
            ease: "power2.out",
            overwrite: "auto"
        });
    }

    updateThumbIcon(percent);
};

const enableScroll = (mode) => {
    if (window.isNavigating) return;

    state.currentScrollMode = mode;
    if (mode === 'NONE') {
        document.body.style.overflowY = 'hidden';
        if (scrollContainer) scrollContainer.style.display = 'none';
    } else {
        document.body.style.overflowY = 'auto';
        if (scrollContainer) scrollContainer.style.display = 'block';
        
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
    updatePopups(state.currentPercent);
};

const updateUI = (percent) => {
    updateThumbPosition(percent);
    updatePopups(percent); 

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
        updatePopups(0); 

    } catch (e) {
        console.error("Error loading videos:", e);
        state.blobs.MAIN = CONFIG.SOURCES.MAIN;
        state.blobs.SEDAN = CONFIG.SOURCES.SEDAN;
        state.blobs.SUV = CONFIG.SOURCES.SUV;
    }
};



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
    state.currentScrollProgress = progress; 

    if (progress > 0.05) {
        if (sliderContainer) sliderContainer.classList.add('hide-ui');
    } else {
        if (sliderContainer) sliderContainer.classList.remove('hide-ui');
    }
    
    if (progress < 0.001) {
        switchToVideo('MAIN');
        updateUI(state.currentPercent);
        return;
    }
    
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


export const initCarDraggingScene = () => {
    container = document.querySelector('#car-dragging-scene');
    mainVideo = document.getElementById('main-video'); 
    track = document.getElementById('figma-track');
    thumb = document.getElementById('figma-thumb');
    scrollContainer = document.getElementById('drag-scroll-container');
    sliderContainer = document.querySelector('.figma-slider-container');
    textIntro = document.getElementById('car-text-intro');
    instructionPopup = document.getElementById('car-drag-popup');
    
    const initSplitType = (el) => {
        if (!el) return;
        const span = el.querySelector('span'); 
        if (span) {
            const split = new SplitType(span, { types: 'words, chars' });
            gsap.set(split.chars, { opacity: 0, y: 8 });
        }
    };

    if (textIntro) initSplitType(textIntro);
    
    if (instructionPopup) {
         const span = instructionPopup.querySelector('.popup-part-text span');
         if (span) {
             const split = new SplitType(span, { types: 'words, chars' });
             gsap.set(split.chars, { opacity: 0, y: 8 });
         }
    }

    window.addEventListener('resize', onResize);
    
    const customCursor = document.querySelector('.custom-cursor');
    const onTrackEnter = () => customCursor && customCursor.classList.add('hovered');
    const onTrackLeave = () => customCursor && customCursor.classList.remove('hovered');

    if (track) {
        track.addEventListener('pointerdown', onPointerDown);
        track.addEventListener('pointermove', onPointerMove);
        track.addEventListener('pointerup', onPointerUp);
        track.addEventListener('mouseenter', onTrackEnter);
        track.addEventListener('mouseleave', onTrackLeave);
    }
    if (mainVideo) {
        mainVideo.addEventListener('timeupdate', onTimeUpdate);
    }

    updateDimensions();
    preloadVideos();
    
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
                    
                    state.sceneActive = true; 
                    state.isInstructionVisible = false; 
                    
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
                    
                    state.sceneActive = true;
                    state.isInstructionVisible = false; 
                    
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
                     
                     state.phasesUnlocked = 0;
                     state.currentPercent = 0;
                     state.activeSourceKey = 'MAIN';
                     state.currentScrollMode = 'SEDAN';
                     state.isDragging = false;
                     state.currentPopup = 'NONE';
                     
                     state.sceneActive = false; 
                     state.isInstructionVisible = false;
                     
                     updateThumbPosition(0);
                     updatePopups(0); 
                     updateActionHint('SCROLL');
                     if (sliderContainer) sliderContainer.classList.remove('hide-ui');
                     enableScroll('SEDAN');
                }
            }
        }
    );
};
