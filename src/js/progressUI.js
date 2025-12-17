import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let currentLabelTarget = '';
let animationInterval = null;

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
    const speed = 30; 
    const increment = 4; 
    
    let clen = newText.length;
    let si = 0;
    let stri = 0;
    let block = "";
    let fixed = "";
    
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


export const showGlobalUI = () => {
    gsap.to('.global-ui-overlay', { opacity: 1, duration: 0.5 });
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

    gsap.set('.global-ui-overlay', { opacity: 0 });
    
    label.textContent = ''; 

    

    ScrollTrigger.create({
        trigger: 'body', 
        start: 'top top',
        endTrigger: '#third-and-fourth-scene', 
        end: 'bottom bottom', 
        scrub: 0, 
        onUpdate: (self) => {
            const rawProgress = self.progress;
            const cutoff = 0.96;
            
            const overlay = document.querySelector('.global-ui-overlay');
            if (overlay) {
                if (rawProgress > cutoff) {
                    overlay.classList.add('ended');
                } else {
                    overlay.classList.remove('ended');
                }
            }

            const scaledProgress = Math.min(1, rawProgress / cutoff);
            const percentage = Math.round(scaledProgress * 100);
            
            const percentageEl = document.querySelector('.progress-percentage');
            if (percentageEl) percentageEl.textContent = `${percentage}%`;

            if (progressBar) progressBar.style.height = `${percentage}%`;

            const newText = getTextForProgress(scaledProgress);
            
            if (newText !== currentLabelTarget) {
                currentLabelTarget = newText;
                animateText(label, newText);
            }
        }
    });


    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.style.pointerEvents = 'auto';
        progressContainer.style.cursor = 'pointer';

        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const percentage = clickY / rect.height;

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
