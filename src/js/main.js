import '../css/style.css'
import '../css/carDragging.css'; 
import '../css/booking.css';
import '../css/progressUI.css';
import { initLoader } from './loader.js';
import { initProgressUI, showGlobalUI, hideGlobalUI } from './progressUI.js';
import gsap from 'gsap';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import SplitType from 'split-type';
import Lenis from 'lenis';
import { initCarDraggingScene } from './carDragging.js';
import { initBookingScene } from './bookingScene.js';
import { Overlay } from './overlay.js';
import { ParticleSimulation } from './particle-simulation.js';
import revealSoundSrc from '../soundaffects/ui-alert-menu-modern-interface-deny-small-230476.mp3';
import bgMusicSrc from '../soundaffects/background_music.mp3';

const revealAudio = new Audio(revealSoundSrc);
const bgAudio = new Audio(bgMusicSrc);
bgAudio.loop = true;
bgAudio.volume = 0.5;

let isSoundEnabled = true; 

gsap.registerPlugin(ScrollTrigger);

const overlayEl = document.querySelector('.overlay');
const overlay = new Overlay(overlayEl, {
    rows: 8,
    columns: 14
});

const initPixelTransition = () => {
    let isAnimating = false;
    gsap.set(".image-comparison", { autoAlpha: 1 });
    gsap.set("header .contact-us-btn, header .logo, header .hamburger, .audio-control", {
        autoAlpha: 1,
        pointerEvents: 'auto'
    });

    ScrollTrigger.create({
        trigger: ".image-comparison",
        start: "top top",
        end: "+=100vh", 
        pin: true,
        scrub: false,
        onLeave: () => {
             if (window.isLoading) {
                window.scrollTo(0, 0);
                return;
            }
            if (window.isNavigating) {
                gsap.set(".image-comparison", { autoAlpha: 0 });
                gsap.set(".scroll-indicator", { autoAlpha: 0 });
                showGlobalUI();
                activateCustomCursor();
                return;
            }

            if (isAnimating) return;
            isAnimating = true;
            
            if (window.lenis) window.lenis.stop();

            overlay.show({
                duration: 0.4,
                ease: 'power3.inOut',
                stagger: index => 0.02 * (overlay.cells.flat()[index].row + gsap.utils.random(0, 5))
            }).then(() => {
                gsap.set(".image-comparison", { autoAlpha: 0 });
                gsap.set(".scroll-indicator", { autoAlpha: 0 });
                
                overlay.hide({
                    duration: 0.4,
                    ease: 'power2',
                    stagger: index => 0.02 * (overlay.cells.flat()[index].row + gsap.utils.random(0, 5))
                }).then(() => {
                    showGlobalUI();
                    gsap.to(".action-hint", {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        delay: 0.2
                    });

                    activateCustomCursor();

                    isAnimating = false;
                    if (window.lenis) window.lenis.start();
                });
            });
        },
        onEnterBack: () => {
            if (window.isNavigating) {
                gsap.set(".image-comparison", { autoAlpha: 1 });
                gsap.set(".scroll-indicator", { autoAlpha: 1 });
                hideGlobalUI();
                deactivateCustomCursor();
                return;
            }

            if (isAnimating) return;
            isAnimating = true;
            
            if (window.lenis) window.lenis.stop();
            deactivateCustomCursor();

            hideGlobalUI();
            gsap.to(".action-hint", {
                autoAlpha: 0,
                y: '100%',
                duration: 0.3,
                ease: 'power2.in'
            });

            overlay.show({
                duration: 0.4,
                ease: 'power3.inOut',
                stagger: index => 0.02 * (overlay.cells.flat()[index].row + gsap.utils.random(0, 5))
            }).then(() => {
                gsap.set(".image-comparison", { autoAlpha: 1 });
                gsap.set(".scroll-indicator", { autoAlpha: 1 });

                overlay.hide({
                    duration: 0.4,
                    ease: 'power2',
                    stagger: index => 0.02 * (overlay.cells.flat()[index].row + gsap.utils.random(0, 5))
                }).then(() => {
                    isAnimating = false;
                    if (window.lenis) window.lenis.start();
                });
            });
        }
    });
};




const menuToggle = document.getElementById('menuToggle');
const menuOverlay = document.getElementById('menuOverlay');
const menuLinks = document.querySelectorAll('.menu-link');
const menuTexts = document.querySelectorAll('.menu-text');

let isMenuOpen = false;
let menuTimeline;
const currentPage = null;

const container = document.querySelector('.comparison-container');
const topImage = document.querySelector('.top-image');
const revealSquare = document.querySelector('.reveal-square');
const lines = {
    top: document.querySelector('.line-top'),
    right: document.querySelector('.line-right'),
    bottom: document.querySelector('.line-bottom'),
    left: document.querySelector('.line-left')
};

let mouseX = 0;
let mouseY = 0;
const squareSize = 150;
let ticking = false;

const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenHint = document.getElementById('fullscreenHint');
let isFullscreen = false;
let hintTimeout = null;

const initCustomCursor = () => {
    const cursor = document.querySelector('.custom-cursor');

    if (!cursor) return;
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });

    window.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
    });

    const interactiveElements = document.querySelectorAll('a, button, .submit-btn, .menu-link, .system-settings');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });
};

const activateCustomCursor = () => {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        cursor.classList.add('active');
        document.documentElement.classList.add('custom-cursor-active');
    }
};

const deactivateCustomCursor = () => {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        cursor.classList.remove('active');
        document.documentElement.classList.remove('custom-cursor-active');
    }
};


const openMenu = () => {
    if (isMenuOpen) return;

    isMenuOpen = true;
    menuToggle.classList.add('active-menu');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();

    const activeLine = document.querySelector('.menu-link.active .menu-line');
    if (activeLine) {
        gsap.set(activeLine, {
            scaleX: 0,
            y: '0%',
            opacity: 1
        });
    }

    menuTimeline = gsap.timeline();

    menuTimeline.to("header .contact-us-btn, header .logo, .audio-control", {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.out'
    }, 0);

    menuTimeline.to(menuOverlay, {
        x: '0%',
        duration: 1.8,
        ease: 'expo.inOut'
    }, 0);

    menuOverlay.classList.add('menu-open');

    menuTimeline.to(menuTexts, {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out'
    }, '-=0.2');

    if (activeLine) {
        menuTimeline.to(activeLine, {
            scaleX: 1,
            duration: 0.8,
            ease: 'expo.inOut'
        }, '-=0.6');
    }
}

const closeMenuFunc = (onCompleteCallback) => {
    if (!isMenuOpen) return;

    const closeTimeline = gsap.timeline({
        onComplete: () => {
            isMenuOpen = false;
            menuOverlay.classList.remove('menu-open');
            menuToggle.classList.remove('active-menu');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            if (window.lenis) window.lenis.start();

            if (typeof onCompleteCallback === 'function') {
                onCompleteCallback(); 
            }

            gsap.to("header .contact-us-btn, header .logo, .audio-control", {
                autoAlpha: 1,
                duration: 0.3,
                ease: 'power2.in',
                delay: 0.3
            });
        }
    });
    
    const activeLine = document.querySelector('.menu-link.active .menu-line');
    
    closeTimeline.to(menuTexts, {
        y: '150%',
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'expo.in'
    });
    
    if (activeLine) {
        closeTimeline.to(activeLine, {
            y: '150%',
            opacity: 0,
            duration: 0.6,
            ease: 'expo.in'
        }, 0);
    }
    
    closeTimeline.to(menuOverlay, {
        x: '100%',
        duration: 1,
        ease: 'expo.inOut'
    }, '-=0.4');
}

const setActivePage = (page) => {
    menuLinks.forEach(link => {
        link.classList.remove('active');
        const line = link.querySelector('.menu-line');
        gsap.set(line, { scaleX: 0 });
    });
    
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

const handleMenuToggleClick = (e) => {
    e.preventDefault();
    
    if (isMenuOpen) {
        closeMenuFunc();
    } else {
        openMenu();
    }
}

const handleMenuLinkClick = (e, link) => {
    e.preventDefault(); 
    const page = link.getAttribute('data-page');
    
    const currentActiveLine = document.querySelector('.menu-link.active .menu-line');
    const newLink = link;
    const newLine = newLink.querySelector('.menu-line');
    
    menuLinks.forEach(l => l.classList.remove('active'));
    newLink.classList.add('active');
    
    const lineTransition = gsap.timeline({
        onComplete: () => {
             if (page) {
                 history.pushState(null, null, '#' + page);
             }
             requestAnimationFrame(() => {
                 let targetScroll = 0;
                 let trigger = null;
                 let progress = 0;
                 let found = false;

                 const findTrigger = (id, selector) => {
                     let t = ScrollTrigger.getById(id);
                     if (!t || !t.isActive) {
                         const all = ScrollTrigger.getAll();
                         t = all.find(st => st.trigger && (st.vars.id === id || st.trigger.id === selector || st.trigger.matches?.(selector)));
                     }
                     return t;
                 };

                 if (page === 'physical') {
                     trigger = findTrigger('intro-video-trigger', '#scroll-container');
                     progress = 0;
                     found = !!trigger;
                 } else if (page === 'digital') {
                     trigger = findTrigger('intro-video-trigger', '#scroll-container');
                     progress = 0.67; 
                     found = !!trigger;
                 } else if (page === 'xr') {
                     trigger = findTrigger('booking-scene-trigger', '#third-and-fourth-scene');
                     progress = 0.266;
                     found = !!trigger;
                 }

                 if (found && trigger) {
                     targetScroll = trigger.start + (trigger.end - trigger.start) * progress;
                     
                     window.isNavigating = true; 
                     
                     if (window.lenis) window.lenis.start();

                     if (window.lenis) {
                         window.lenis.scrollTo(targetScroll, { 
                             duration: 1.5, 
                             ease: 'power2.inOut', 
                             immediate: false,
                             onComplete: () => {
                                 closeMenuFunc(() => {
                                     window.isNavigating = false;
                                 });
                             }
                         });
                     } else {
                         window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                         setTimeout(() => {
                             closeMenuFunc(() => {
                                 window.isNavigating = false;
                             });
                         }, 1500);
                     }
                 } else {
                     console.warn('Navigation target not found for page:', page);
                     closeMenuFunc();
                 }
             });
        }
    });
    
    if (currentActiveLine && currentActiveLine !== newLine) {
        lineTransition.to(currentActiveLine, {
            scaleX: 0,
            duration: 0.4,
            ease: 'expo.inOut'
        });
    }
    
    lineTransition.to(newLine, {
        scaleX: 1,
        duration: 0.5,
        ease: 'expo.inOut'
    }, currentActiveLine && currentActiveLine !== newLine ? '-=0.2' : 0);
    
    console.log('Navigate to:', page);
}

const handleMenuEscapeKey = (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
        closeMenuFunc();
    }
}

let revealState = {
    mouseX: 0,
    mouseY: 0,
    isActive: false
};

const updateRevealEffect = () => {
    if (!revealState.isActive || !container) return;

    const rect = container.getBoundingClientRect();
    const x = revealState.mouseX - rect.left;
    const y = revealState.mouseY - rect.top;

    const halfSize = squareSize / 2;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const safeX = Math.max(halfSize, Math.min(width - halfSize, x));
    const safeY = Math.max(halfSize, Math.min(height - halfSize, y));

    const left = Math.round(safeX - halfSize);
    const right = Math.round(safeX + halfSize);
    const top = Math.round(safeY - halfSize);
    const bottom = Math.round(safeY + halfSize);

    revealSquare.style.left = `${left}px`;
    revealSquare.style.top = `${top}px`;

    topImage.style.clipPath = `polygon(
        ${left}px ${top}px,
        ${right}px ${top}px,
        ${right}px ${bottom}px,
        ${left}px ${bottom}px
    )`;

    updateLines(left, right, top, bottom, width, height);
}

const handleGlobalMouseMove = (e) => {
    if (!container) return;
    
    revealState.mouseX = e.clientX;
    revealState.mouseY = e.clientY;
    
    const rect = container.getBoundingClientRect();
    
    const buffer = 100; 
    const isInside = (
        e.clientX >= rect.left - buffer && 
        e.clientX <= rect.right + buffer && 
        e.clientY >= rect.top - buffer && 
        e.clientY <= rect.bottom + buffer
    );

    if (isInside) {
        if (!revealState.isActive) {
            revealState.isActive = true;
            topImage.style.clipPath = 'none'; 
        }
    } else {
        if (revealState.isActive) {
            revealState.isActive = false;
            
            topImage.style.clipPath = 'inset(100% 100% 100% 100%)';
             
            if (lines.top) lines.top.style.width = '0px';
            if (lines.left) lines.left.style.height = '0px';
            if (lines.bottom) lines.bottom.style.width = '0px';
            if (lines.right) lines.right.style.height = '0px';
        }
    }
}

const updateLines = (left, right, top, bottom, width, height) => {
    if (lines.top) {
        lines.top.style.top = `${top}px`;
        lines.top.style.left = `0px`;
        lines.top.style.width = `${left}px`;
    }

    if (lines.left) {
        lines.left.style.left = `${left}px`;
        lines.left.style.top = `0px`;
        lines.left.style.height = `${top}px`;
    }

    if (lines.bottom) {
        lines.bottom.style.top = `${bottom}px`;
        lines.bottom.style.left = `${right}px`;
        lines.bottom.style.width = `${width - right}px`;
    }

    if (lines.right) {
        lines.right.style.left = `${right}px`;
        lines.right.style.top = `${bottom}px`;
        lines.right.style.height = `${height - bottom}px`;
    }
}

const toggleFullscreen = () => {
    if (!isFullscreen) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
}

const enterFullscreen = () => {
    document.documentElement.requestFullscreen()
        .then(() => {
            isFullscreen = true;
            updateFullscreenUI(true);
            showFullscreenHint();
        })
        .catch((err) => {
            console.error(`Error entering fullscreen: ${err.message}`);
        });
}

const exitFullscreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen()
            .then(() => {
                isFullscreen = false;
                updateFullscreenUI(false);
                hideFullscreenHint();
            })
            .catch((err) => {
                console.error(`Error exiting fullscreen: ${err.message}`);
            });
    }
}

const updateFullscreenUI = (isActive) => {
    if (isActive) {
        fullscreenBtn.classList.add('active');
    } else {
        fullscreenBtn.classList.remove('active');
    }
}

const showFullscreenHint = () => {
    if (fullscreenHint) {
        fullscreenHint.classList.add('show');
        
        if (hintTimeout) {
            clearTimeout(hintTimeout);
        }
        
        hintTimeout = setTimeout(hideFullscreenHint, 3000);
    }
}

const hideFullscreenHint = () => {
    if (fullscreenHint) {
        fullscreenHint.classList.remove('show');
    }
}

const adjustProjectInfoPosition = () => {
    const projectInfo = document.querySelector('.project-info');
    if (!projectInfo) return;

    if (document.fullscreenElement) {
        projectInfo.style.top = '22vh';
    } else {
        projectInfo.style.top = '16.5vh';
    }
}

const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
        isFullscreen = false;
        updateFullscreenUI(false);
        hideFullscreenHint();

        if (hintTimeout) {
            clearTimeout(hintTimeout);
        }
    } else {
        isFullscreen = true;
        updateFullscreenUI(true);
    }

    adjustProjectInfoPosition();
}

let savedTriggerState = {
    id: null,
    progress: null
};

ScrollTrigger.addEventListener("refreshInit", () => {
    const triggers = ['car-dragging-trigger'];
    savedTriggerState.id = null;
    savedTriggerState.progress = null;

    for (const id of triggers) {
        const st = ScrollTrigger.getById(id);
        if (st && st.isActive) {
            savedTriggerState.id = id;
            savedTriggerState.progress = st.progress;
            break; // Found the active one
        }
    }
});

ScrollTrigger.addEventListener("refresh", () => {
    if (savedTriggerState.id && savedTriggerState.progress !== null) {
        const st = ScrollTrigger.getById(savedTriggerState.id);
        if (st) {
            const newScroll = st.start + (st.end - st.start) * savedTriggerState.progress;
            if (window.lenis) {
                window.lenis.scrollTo(newScroll, { immediate: true });
            } else {
                window.scrollTo(0, newScroll);
            }
        }
    }
});

const handleFullscreenEscapeKey = (e) => {
    if (e.key === 'Escape' && isFullscreen) {
        return;
    }
}


const initMenuListeners = () => {
    if (menuToggle) {
        menuToggle.addEventListener('click', handleMenuToggleClick);
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => handleMenuLinkClick(e, link));
    });

    document.addEventListener('keydown', handleMenuEscapeKey);
}

const initImageComparisonListeners = () => {
    if (container && topImage && revealSquare) {
        topImage.style.transition = 'none';
        revealSquare.style.transition = 'opacity 0.3s ease';
        window.addEventListener('mousemove', handleGlobalMouseMove);
        
        gsap.ticker.add(updateRevealEffect);
    }
}

const initAudioToggle = () => {
    const audioToggle = document.querySelector('.audio-toggle');
    if (!audioToggle) return;

    audioToggle.addEventListener('click', () => {
        const isPressed = audioToggle.getAttribute('aria-pressed') === 'true';
        const newState = !isPressed;
        
        audioToggle.setAttribute('aria-pressed', newState);
        isSoundEnabled = newState; 

        if (isSoundEnabled) {
            bgAudio.play().catch(e => console.warn("Audio play blocked:", e));
        } else {
            bgAudio.pause();
        }
    });
};

const initFullscreenListeners = () => {
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('keydown', handleFullscreenEscapeKey);
    }
}


const animateProjectDescription = () => {
    const description = document.querySelector('.project-description');
    if (!description) return;

    const text = description.textContent.replace(/\s+/g, ' ').trim();

    description.innerHTML = text.split(' ').map(word =>
        `<span class="word" style="display:inline-block; will-change:transform; margin-right:0.25em;">${word}</span>`
    ).join('');

    gsap.set('.project-description .word', { y: 50, opacity: 0 }); 
    
    gsap.to('.project-description .word', { 
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "back.out(1.7)",
        delay: 0.2
    });
}

const CONFIG = {
    scrollScrub: 1.5, 
    textTimings: {
        text1: { show: 0.05, hide: 0.15 },
        text2: { show: 0.18, hide: 0.28 },
        text3: { show: 0.39, hide: 0.60 },
        text4: { show: 0.67, hide: 0.94 }
    },
    animation: {
        charDuration: 0.03,
        charStagger: 0.015,
        fadeInDuration: 0.01,
        fadeOutDuration: 0.02
    }
};


const initVideoScroll = () => {
    const video = document.querySelector(".video-background");
    if (!video) return;
    
    const src = video.currentSrc || video.src;

    setupIOSVideoActivation(video);
    setupSmoothScroll();
    loadVideoOptimized(video, src);
};

const setupIOSVideoActivation = (video) => {
    const activateIOS = () => {
        video.play();
        video.pause();
    };
    
    document.documentElement.addEventListener("touchstart", activateIOS, { once: true });
};

const setupSmoothScroll = () => {
    const lenis = new Lenis();
    window.lenis = lenis; 

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
};

const loadVideoOptimized = (video, src) => {
    if (window.fetch) {
        fetch(src)
            .then(response => response.blob())
            .then(blob => {
                const blobURL = URL.createObjectURL(blob);
                video.src = blobURL;
                video.addEventListener("loadedmetadata", () => initScrollAnimation(video), { once: true });
            })
            .catch(() => {
                initScrollAnimation(video);
            });
    } else {
        initScrollAnimation(video);
    }
};

const initScrollAnimation = (video) => {
    if (!video.duration || isNaN(video.duration)) {
        video.addEventListener("loadedmetadata", () => initScrollAnimation(video), { once: true });
        return;
    }

    cleanupScrollTriggers();
    
    const timeline = createMainTimeline(video);
    
    addVideoScrubbing(timeline, video);
    addTextAnimations(timeline);
};

const cleanupScrollTriggers = () => {
    const mainTrigger = ScrollTrigger.getById('intro-video-trigger');
    if (mainTrigger) mainTrigger.kill();

    ScrollTrigger.getAll().forEach(trigger => {
        const t = trigger.vars.trigger;
        if (t === "#scroll-container" || trigger.trigger === document.querySelector("#scroll-container")) {
            trigger.kill();
        }
    });
};

const createMainTimeline = (video) => {
    return gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: CONFIG.scrollScrub,
            onUpdate: updateScrollProgress,
            id: 'intro-video-trigger'
        }
    });
};

const updateScrollProgress = (self) => {
    const progress = Math.round(self.progress * 100);
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar && progressText) {
        progressBar.style.setProperty('--progress', `${progress}%`);
        progressText.textContent = `${progress}%`;
    }
};

const addVideoScrubbing = (timeline, video) => {
    timeline.fromTo(
        video,
        { currentTime: 0 },
        { 
            currentTime: video.duration, 
            ease: "none", 
            duration: 1 
        }
    );
};

const addTextAnimations = (timeline) => {
    document.querySelectorAll("#scroll-container .text-overlay").forEach(element => {
        const spanElement = element.querySelector("span");
        if (spanElement) {
            element.splitInstance = new SplitType(spanElement, { types: "words, chars" });
        }
    });

    const timings = CONFIG.textTimings;
    
    addTextOverlay(timeline, "#text-1", timings.text1.show, timings.text1.hide);
    addTextOverlay(timeline, "#text-2", timings.text2.show, timings.text2.hide);
    addTextOverlay(timeline, "#text-3", timings.text3.show, timings.text3.hide);
    addTextOverlay(timeline, "#text-4", timings.text4.show, timings.text4.hide);
};

const addTextOverlay = (timeline, selector, showAt, hideAt) => {
    timeline.to(selector, {
        opacity: 1,
        duration: CONFIG.animation.fadeInDuration,
        onStart: () => animateTypingEffect(selector)
    }, showAt);
    
    if (hideAt !== null) {
        timeline.to(selector, {
            opacity: 0,
            duration: CONFIG.animation.fadeOutDuration,
            onReverseStart: () => {
                const element = document.querySelector(selector);
                if (element && element.splitInstance && element.splitInstance.chars) {
                     gsap.set(element.splitInstance.chars, { opacity: 0, y: 8 });
                }
            },
            onReverseComplete: () => animateTypingEffect(selector)
        }, hideAt);
    }
};

const animateTypingEffect = (selector) => {
    const element = document.querySelector(selector);
    if (!element || !element.splitInstance) return;

    gsap.fromTo(
        element.splitInstance.chars,
        {
            opacity: 0,
            y: 8
        },
        {
            opacity: 1,
            y: 0,
            duration: CONFIG.animation.charDuration,
            ease: "power1.out",
            stagger: CONFIG.animation.charStagger,
            onStart: () => {
                 if (isSoundEnabled && !window.isNavigating) {
                    revealAudio.currentTime = 0;
                    revealAudio.play().catch(() => { /* Auto-play blocked */ });
                }
            }
        }
    );
};





const init = () => {
    window.isLoading = true;

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const particleCanvas = document.getElementById('loader-background');
    let particleSim = null;
    if (particleCanvas) {
        particleSim = new ParticleSimulation(particleCanvas);
        particleSim.start();
    }

    const mobileCanvas = document.getElementById('mobile-background');
    if (mobileCanvas) {
        const mobileSim = new ParticleSimulation(mobileCanvas);
        mobileSim.start();
    }

    initVideoScroll(); 
    initLoader(); 
    setActivePage(currentPage);
    initMenuListeners();
    initImageComparisonListeners();
    initFullscreenListeners();
    initAudioToggle();
    initPixelTransition(); 
    initCustomCursor();
    initCarDraggingScene();
    initBookingScene(overlay);
    initProgressUI();
    
    window.addEventListener('loader:dismissed', () => {
        window.isLoading = false; 
        
        if (isSoundEnabled) {
             bgAudio.currentTime = 0;
             bgAudio.play().catch(e => console.warn("Autoplay blocked:", e));
        }

        animateProjectDescription();
        
        if (particleSim) {
            setTimeout(() => {
                particleSim.stop();
            }, 1000); 
        }
    });
    
    if (typeof initBookingForm === 'function') {
    }
}



init();
