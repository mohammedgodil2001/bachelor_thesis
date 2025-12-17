import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// HTML Elements (cached lazily or queried)
let currentLabelTarget = '';
let animationInterval = null;

// Define the Text Map based on percentages
const getTextForProgress = (progress) => {
    const p = progress * 100;
    if (p < 25) return 'INTRO';
    if (p < 39) return 'SOFTWARE';
    if (p < 58) return 'STRUCTURAL VERSATILITY';
    if (p < 68) return 'PHYSICAL INTEGRATION';
    if (p < 86) return 'TRACKING SYSTEM'; 
    if (p < 90) return 'XR IMMERSION';
    if (p < 97) return 'VR EXPERIENCE'; 
    return 'INTERESTED';
};

const animateText = (element, newText) => {
    const theLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&^+=-";
    const speed = 30; // ms per frame
    const increment = 4; // frames per step
    
    let clen = newText.length;
    let si = 0;
    let stri = 0;
    let block = "";
    let fixed = "";
    
    // Explicitly clear any existing interval
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    animationInterval = setInterval(() => {
        block = "";
        for (let j = 0; j < clen - stri; j++) {
            const num = Math.floor(Math.random() * theLetters.length);
            const letter = theLetters.charAt(num);
            block += letter;
        }
        
        if (si === (increment - 1)) {
            stri++;
        }
        
        if (si === increment) {
            if (stri > 0 && stri <= newText.length) {
                fixed += newText.charAt(stri - 1);
            }
            si = 0;
        }
        
        element.textContent = fixed + block;
        
        si++;
        
        if (stri >= clen) {
            element.textContent = newText;
            if (animationInterval) {
                clearInterval(animationInterval);
                animationInterval = null;
            }
        }
        
    }, speed);
};

// EXPORTED CONTROLS for Main.js
export const showGlobalUI = () => {
    gsap.to('.global-ui-overlay', { opacity: 1, duration: 0.5 });
    // Trigger animation on show
    const label = document.getElementById('section-label');
    if (label && currentLabelTarget) {
        animateText(label, currentLabelTarget);
    }
};

export const hideGlobalUI = () => gsap.to('.global-ui-overlay', { opacity: 0, duration: 0.5 });


export const initProgressUI = () => {
    const label = document.getElementById('section-label');
    const progressBar = document.getElementById('global-progress');
    
    if (!label || !progressBar) return;

    gsap.registerPlugin(ScrollTrigger);

    // Initial state: Hidden
    gsap.set('.global-ui-overlay', { opacity: 0 });
    
    // Clear initial text to ensure animation effect if it runs early
    label.textContent = ''; 

    // 1. Global Progress Bar Logic - SYNCED WITH PERCENTAGE
    // We update this in the scroll listener to ensure it matches the text exactly.
    
    // 1. Unified Progress Logic (Bar, Text, Label) using GSAP
    // This replaces the raw scroll listener to fix video glitches and syncing issues.
    
    // Define the Text Map based on percentages
    

    // calculate Trigger End:
    // The user wants it to finish "before entering the form".
    // The form is inside #third-and-fourth-scene. 
    // The booking scene ends when the form is fully visible.
    

    // Animation State
    

    ScrollTrigger.create({
        trigger: 'body', // Track the whole page flow
        start: 'top top',
        endTrigger: '#third-and-fourth-scene', 
        end: 'bottom bottom', // Ends when the booking scene scrolling is done (form matches)
        scrub: 0, // Instant scrub for immediate feedback, or small value for smooth
        onUpdate: (self) => {
            const rawProgress = self.progress;
            const cutoff = 0.96;
            
            // 1. Manage Visibility (Hide after 96%)
            const overlay = document.querySelector('.global-ui-overlay');
            if (overlay) {
                if (rawProgress > cutoff) {
                    overlay.classList.add('ended');
                } else {
                    overlay.classList.remove('ended');
                }
            }

            // 2. Scale Progress: 0 -> 0.96 becomes 0% -> 100%
            // We clamp it to max 1 (100%) so it doesn't go over 100 before hiding
            const scaledProgress = Math.min(1, rawProgress / cutoff);
            const percentage = Math.round(scaledProgress * 100);
            
            // 3. Update Percentage Text
            const percentageEl = document.querySelector('.progress-percentage');
            if (percentageEl) percentageEl.textContent = `${percentage}%`;

            // 4. Update Progress Bar Height
            if (progressBar) progressBar.style.height = `${percentage}%`;

            // 5. Update Section Label SCRAMBLE ANIMATION
            const newText = getTextForProgress(scaledProgress);
            
            // Only trigger animation if the TARGET text changes
            if (newText !== currentLabelTarget) {
                currentLabelTarget = newText;
                animateText(label, newText);
            }
        }
    });

    // 3. Click Navigation (Updated to use GSAP scroll)
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.style.pointerEvents = 'auto';
        progressContainer.style.cursor = 'pointer';

        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const percentage = clickY / rect.height;

            // Find the total scroll distance managed by our main trigger
            // We need to resolve the 'end' point value to scroll correctly
            const bodySt = ScrollTrigger.getAll().find(st => st.trigger === document.body || (st.trigger && st.trigger.tagName === 'BODY'));
            
            if (bodySt) {
                const totalDist = bodySt.end - bodySt.start;
                const targetScroll = bodySt.start + (totalDist * percentage);
                
                if (window.lenis) {
                    window.lenis.scrollTo(targetScroll);
                } else {
                     window.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
};
