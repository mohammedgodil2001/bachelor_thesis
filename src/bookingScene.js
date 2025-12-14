
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import videoOptimizedSrc from './images/video_optimized.mp4';

gsap.registerPlugin(ScrollTrigger);

export const initBookingScene = () => {
    const section = document.querySelector('#third-and-fourth-scene');
    const videoWrapper = document.querySelector('#video-wrapper');
    const video = videoWrapper.querySelector('video');
    const bookingSection = document.querySelector('.booking-section');
    const headsetOverlay = document.getElementById('headset-overlay');
    const headsetPopup = document.getElementById('headset-popup');

    if (!section || !videoWrapper || !video) return;

    // Set video source
    video.src = videoOptimizedSrc;

    // Initial state
    gsap.set(videoWrapper, { opacity: 0, pointerEvents: 'none' }); 
    gsap.set(headsetOverlay, { opacity: 0, pointerEvents: 'none' });
    gsap.set(bookingSection, { opacity: 0, pointerEvents: 'none' });

    // --- Overlay Text Animations ---
    const overlayTexts = {}; // Store SplitType instances

    const initTextOverlays = () => {
        // Target elements with data-overlay-id
        const overlays = document.querySelectorAll('[data-overlay-id]');
        overlays.forEach(element => {
            const spanElement = element.querySelector('span');
            if (spanElement) {
                 const id = element.dataset.overlayId;
                 overlayTexts[id] = new SplitType(spanElement, { types: 'words, chars' });
                 // HIDE initially to override CSS opacity:1, so animation can happen
                 gsap.set(overlayTexts[id].chars, { opacity: 0, y: 8, visibility: 'hidden' }); 
                 gsap.set(element, { opacity: 0 });
            }
        });
        
        // Headset popup text too
        const headsetText = headsetPopup.querySelector('.popup-part-text span');
        if (headsetText) {
             overlayTexts['headset'] = new SplitType(headsetText, { types: 'words, chars' });
             gsap.set(overlayTexts['headset'].chars, { opacity: 0, y: 8, visibility: 'hidden' });
        }
    };

    const addTextOverlayAnimations = (timeline) => {
         const overlays = document.querySelectorAll('[data-overlay-id]');
         // Sort overlays by ID just to be sure
         const sortedOverlays = Array.from(overlays).sort((a, b) => a.dataset.overlayId - b.dataset.overlayId);

         // Helper to animate text in
         const animateTextIn = (id) => {
             const split = overlayTexts[id];
             if(!split) return gsap.timeline();
             return gsap.fromTo(split.chars, 
                 { opacity: 0, y: 10 },
                 { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power2.out' }
             );
         };

         // Helper to animate text out
         const animateTextOut = (id) => {
             const split = overlayTexts[id];
             if(!split) return gsap.timeline();
             return gsap.to(split.chars, { opacity: 0, y: -10, duration: 0.3, stagger: 0.01, ease: 'power2.in' });
         };

         // 1. Text 1
         timeline.to(sortedOverlays[0], { opacity: 1, duration: 0.5 }, '+=0.5')
                 .add(animateTextIn('1'), '<');
         timeline.to(sortedOverlays[0], { opacity: 0, duration: 0.5 }, '+=2') // Stay for 2s
                 .add(animateTextOut('1'), '<');

         // 2. Text 2
         timeline.to(sortedOverlays[1], { opacity: 1, duration: 0.5 }, '+=0.5')
                 .add(animateTextIn('2'), '<');
         timeline.to(sortedOverlays[1], { opacity: 0, duration: 0.5 }, '+=2')
                 .add(animateTextOut('2'), '<');

         // 3. Text 3
         timeline.to(sortedOverlays[2], { opacity: 1, duration: 0.5 }, '+=0.5')
                 .add(animateTextIn('3'), '<');
         timeline.to(sortedOverlays[2], { opacity: 0, duration: 0.5 }, '+=2')
                 .add(animateTextOut('3'), '<');

         // 4. Text 4
         timeline.to(sortedOverlays[3], { opacity: 1, duration: 0.5 }, '+=0.5')
                 .add(animateTextIn('4'), '<');
         timeline.to(sortedOverlays[3], { opacity: 0, duration: 0.5 }, '+=2')
                 .add(animateTextOut('4'), '<');
         
         // 5. Headset Overlay
         timeline.to(headsetOverlay, { opacity: 1, pointerEvents: 'auto', duration: 0.5 }, '+=0.5')
                 .to(headsetPopup, { opacity: 1, y: '0%', duration: 0.5 }, '<')
                 .add(animateTextIn('headset'), '<');
    };


    initTextOverlays();


    // --- Main Timeline ---
    // Initialize immediately to ensure pinning and layout work regardless of video load state
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=600%", // Long scroll duration
            pin: true,
            scrub: 1, // Smooth scrubbing
            onEnter: () => {
                 // video.currentTime = 0; // Don't reset if scrubbing handles it
                 video.pause(); // Ensure paused initially, scrubbing controls time
            },
             onLeaveBack: () => {
                 video.currentTime = 0;
                 video.pause();
             }
        }
    });

    // 1. Fade in video wrapper (dissolve from previous scene)
    timeline.to(videoWrapper, { opacity: 1, duration: 1, ease: "power2.inOut" });

    // Label for the main sequence start
    timeline.add('sequenceStart');

    // 2. Video Scrubbing (Lazy Add)
    // We define a function to add the scrub tween so we can call it now or later
    const addVideoScrub = () => {
        if (video.duration) {
            timeline.fromTo(video, 
                { currentTime: 0 }, 
                { currentTime: video.duration, duration: 15, ease: "none" }, 
                'sequenceStart'
            );
        }
    };

    // Use a promise to ensure video metadata is loaded before adding scrub
    const videoLoadedPromise = new Promise(resolve => {
        if (video.readyState >= 1) {
            resolve();
        } else {
            video.addEventListener('loadedmetadata', resolve, { once: true });
        }
    });

    // Add video scrub to timeline only after metadata is loaded
    videoLoadedPromise.then(() => {
        addVideoScrub();
    });

    // 3. Add text overlay animations (Triggered by scroll, but played in real-time)
    const addTextOverlaySequence = (tl, startLabel) => {
         const overlays = document.querySelectorAll('[data-overlay-id]');
         const sortedOverlays = Array.from(overlays).sort((a, b) => a.dataset.overlayId - b.dataset.overlayId);

         const animateTextIn = (id) => {
             const split = overlayTexts[id];
             if(!split || !split.chars) return; 
             
             // Exact Config from main.js: Time-based, NOT scrubbed
             gsap.fromTo(split.chars, 
                 { opacity: 0, y: 8, visibility: 'visible' },
                 { 
                     opacity: 1, 
                     y: 0, 
                     autoAlpha: 1, 
                     duration: 0.03, // Fast (real-time)
                     stagger: 0.015, 
                     ease: 'power1.out',
                     overwrite: true // Ensure we override any previous states
                 }
             );
         };

         // Text 1
         tl.to(sortedOverlays[0], { 
                opacity: 1, 
                duration: 0.1, 
                onStart: () => animateTextIn('1')
            }, `${startLabel}+=0.5`)
           .to(sortedOverlays[0], { opacity: 0, duration: 0.5 }, `${startLabel}+=3`);

         // Text 2
         tl.to(sortedOverlays[1], { 
                opacity: 1, 
                duration: 0.1,
                onStart: () => animateTextIn('2')
            }, `${startLabel}+=4`)
           .to(sortedOverlays[1], { opacity: 0, duration: 0.5 }, `${startLabel}+=6.5`);

         // Text 3
         tl.to(sortedOverlays[2], { 
                opacity: 1, 
                duration: 0.1,
                onStart: () => animateTextIn('3')
            }, `${startLabel}+=7.5`)
           .to(sortedOverlays[2], { opacity: 0, duration: 0.5 }, `${startLabel}+=10`);

         // Text 4
         tl.to(sortedOverlays[3], { 
                opacity: 1, 
                duration: 0.1,
                onStart: () => animateTextIn('4')
            }, `${startLabel}+=11`)
           .to(sortedOverlays[3], { opacity: 0, duration: 0.5 }, `${startLabel}+=13.5`);
         
         // Headset
         tl.to(headsetOverlay, { opacity: 1, pointerEvents: 'auto', duration: 0.1 }, `${startLabel}+=14`)
           .to(headsetPopup, { opacity: 1, y: '0%', duration: 0.5 }, '<')
           .call(() => animateTextIn('headset'), null, '<');
    };

    addTextOverlaySequence(timeline, 'sequenceStart');

    // 3. Fade out video at the end (after sequence)
    // We place this at absolute time relative to sequenceStart to ensure consistency
    timeline.to(videoWrapper, { opacity: 0, duration: 1, ease: "power2.inOut" }, 'sequenceStart+=15');

    // 4. Show Booking Form
    timeline.to(bookingSection, { opacity: 1, pointerEvents: 'auto', duration: 1 }, '<+=0.5');


    // Handle Booking Form Interaction (Basic visibility toggling)
    const bookingForm = document.getElementById('bookingForm');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const formInputs = step1 ? step1.querySelectorAll('input') : [];

    const checkStep1Validity = () => {
         const allValid = Array.from(formInputs).every(input => input.value.trim() !== '');
         if(nextBtn) nextBtn.disabled = !allValid;
    };

    if(formInputs.length > 0) {
        formInputs.forEach(input => input.addEventListener('input', checkStep1Validity));
    }

    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
             step1.classList.remove('active');
             step2.classList.add('active');
             document.querySelectorAll('.step-indicator')[1].classList.add('active');
             document.querySelectorAll('.step-indicator')[0].classList.add('completed');
        });
    }

    if(backBtn) {
        backBtn.addEventListener('click', () => {
             step2.classList.remove('active');
             step1.classList.add('active');
             document.querySelectorAll('.step-indicator')[1].classList.remove('active');
             document.querySelectorAll('.step-indicator')[0].classList.remove('completed');
        });
    }

};
