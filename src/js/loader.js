import gsap from 'gsap';

export const initLoader = () => {
    const loaderScreen = document.getElementById('loader-screen');
    const progressBar = document.querySelector('.loader-progress-bar');
    const percentageText = document.querySelector('.loader-percentage');
    const enterMsg = document.querySelector('.loader-enter-msg');
    
    if (!loaderScreen || !progressBar) return;

    window.scrollTo(0, 0);
    if (window.lenis) {
        window.lenis.stop();
        window.lenis.scrollTo(0, { immediate: true });
    }
    
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

    let progress = 0;
    const interval = setInterval(() => {
        const increment = Math.random() * 5; 
        progress += increment;

        if (progress > 99) progress = 99;

        progressBar.style.width = `${progress}%`;
        percentageText.textContent = `${Math.floor(progress)}%`;

    }, 100); 

    setTimeout(() => {
        clearInterval(interval);
        completeLoading();
    }, 2500);

    function completeLoading() {
        progressBar.style.width = '100%';
        percentageText.textContent = '100%';
        gsap.to(enterMsg, { 
            opacity: 1, 
            pointerEvents: 'auto', 
            duration: 0.5, 
            delay: 0.2,
            onComplete: () => {
            }
        });

        loaderScreen.style.cursor = 'pointer';
        loaderScreen.addEventListener('click', dismissLoader, { once: true });
    }

    function dismissLoader() {
        loaderScreen.classList.add('fade-out');
        window.dispatchEvent(new CustomEvent('loader:dismissed'));
        setTimeout(() => {
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);

            if (window.lenis) window.lenis.start();
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            loaderScreen.style.display = 'none';
        }, 800); 
        const video = document.querySelector('#video-wrapper video');
        if (video) {
            video.play().catch(e => console.log('Autoplay handled by scroll or blocked:', e));
        }
    }
};
