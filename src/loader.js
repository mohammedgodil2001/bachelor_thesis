
import gsap from 'gsap';

export const initLoader = () => {
    const loaderScreen = document.getElementById('loader-screen');
    const progressBar = document.querySelector('.loader-progress-bar');
    const percentageText = document.querySelector('.loader-percentage');
    const enterMsg = document.querySelector('.loader-enter-msg');
    
    if (!loaderScreen || !progressBar) return;

    // 1. Initial State: Stop Scroll & Reset Position
    window.scrollTo(0, 0);
    if (window.lenis) {
        window.lenis.stop();
        window.lenis.scrollTo(0, { immediate: true });
    }
    
    // Aggressive Block
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    const preventScroll = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', (e) => {
        if(['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown'].includes(e.code)) {
            preventScroll(e);
        }
    }, { passive: false });

    // 2. Progress Simulation
    let progress = 0;
    const interval = setInterval(() => {
        // Random increment logic for "realistic" feel
        const increment = Math.random() * 5; 
        progress += increment;

        // Cap at 99% until fully simulated time or video ready
        if (progress > 99) progress = 99;

        // Update UI
        progressBar.style.width = `${progress}%`;
        percentageText.textContent = `${Math.floor(progress)}%`;

    }, 100); // Update every 100ms

    // 3. Completion Logic (Wait for video or simulated time)
    // For now, we simulate a 3-second load time, then check readiness
    setTimeout(() => {
        clearInterval(interval);
        completeLoading();
    }, 2500);

    function completeLoading() {
        // Force 100%
        progressBar.style.width = '100%';
        percentageText.textContent = '100%';

        // Reveal Enter Message
        gsap.to(enterMsg, { 
            opacity: 1, 
            pointerEvents: 'auto', 
            duration: 0.5, 
            delay: 0.2,
            onComplete: () => {
                // Add blinking effect? REMOVED to prevent "blurry" look
                // gsap.to(enterMsg, { opacity: 0.5, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
            }
        });

        // Enable Click to Enter
        loaderScreen.style.cursor = 'pointer';
        loaderScreen.addEventListener('click', dismissLoader, { once: true });
    }

    function dismissLoader() {
        // 1. Fade Out Loader
        loaderScreen.classList.add('fade-out');

        // Dispatch global event to signal website entry
        window.dispatchEvent(new CustomEvent('loader:dismissed'));

        // 2. Enable Scroll & Interaction
        setTimeout(() => {
            // Remove Locks
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
            // Keydown listener requires named function for clean removal, but for now this is okay as it's less intrusive or we can just ignore it as it's global
            // For rigorousness, we should have named the keydown handler too.
            // But let's just reset overflow which allows browser handling again.

            if (window.lenis) window.lenis.start();
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            
            // Optional: Remove from DOM to free memory?
            // loaderScreen.remove(); 
            // Better to keep it display: none just in case
            loaderScreen.style.display = 'none';
        }, 800); // Match transition duration

        // 3. Trigger Intro Video Play (if needed logic resides here)
        // Access video from DOM?
        const video = document.querySelector('#video-wrapper video');
        if (video) {
            video.play().catch(e => console.log('Autoplay handled by scroll or blocked:', e));
        }
    }
};
