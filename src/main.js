import './style.css'
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


const menuToggle = document.getElementById('menuToggle');
const menuOverlay = document.getElementById('menuOverlay');
const menuLinks = document.querySelectorAll('.menu-link');
const menuTexts = document.querySelectorAll('.menu-text');

let isMenuOpen = false;
let menuTimeline;
const currentPage = 'physical';

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
const squareSize = 100;
let ticking = false;

const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenHint = document.getElementById('fullscreenHint');
let isFullscreen = false;
let hintTimeout = null;


const openMenu = () => {
    if (isMenuOpen) return;
    
    isMenuOpen = true;
    menuToggle.classList.add('active-menu');
    
    const activeLine = document.querySelector('.menu-link.active .menu-line');
    if (activeLine) {
        gsap.set(activeLine, { 
            scaleX: 0,
            y: '0%',
            opacity: 1
        });
    }
    
    menuTimeline = gsap.timeline();
    
    menuTimeline.to(menuOverlay, {
        x: '0%',
        duration: 1.8,
        ease: 'expo.inOut'
    });
    
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

const closeMenuFunc = () => {
    if (!isMenuOpen) return;
    
    const closeTimeline = gsap.timeline({
        onComplete: () => {
            isMenuOpen = false;
            menuOverlay.classList.remove('menu-open');
            menuToggle.classList.remove('active-menu');
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

const handleMenuLinkClick = (link) => {
    const page = link.getAttribute('data-page');
    
    if (link.classList.contains('active')) {
        closeMenuFunc();
        return;
    }
    
    const currentActiveLine = document.querySelector('.menu-link.active .menu-line');
    const newLink = link;
    const newLine = newLink.querySelector('.menu-line');
    
    menuLinks.forEach(l => l.classList.remove('active'));
    newLink.classList.add('active');
    
    const lineTransition = gsap.timeline({
        onComplete: closeMenuFunc
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

const handleMouseMove = (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    if (!ticking) {
        requestAnimationFrame(updateRevealEffectFrame);
        ticking = true;
    }
}

const updateRevealEffectFrame = () => {
    updateRevealEffect(mouseX, mouseY);
    ticking = false;
}

const handleMouseLeave = () => {
    topImage.style.clipPath = 'inset(100% 100% 100% 100%)';
}

const updateRevealEffect = (x, y) => {
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
        // In fullscreen mode - adjust to maintain visual position
        projectInfo.style.top = '21vh';
    } else {
        // Normal mode - reset to original
        projectInfo.style.top = '15vh';
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

    // Adjust project info position
    adjustProjectInfoPosition();
}

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
        link.addEventListener('click', () => handleMenuLinkClick(link));
    });

    document.addEventListener('keydown', handleMenuEscapeKey);
}

const initImageComparisonListeners = () => {
    if (container && topImage && revealSquare) {
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
    }
}

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

    gsap.from('.project-description .word', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "back.out(1.7)",
        delay: 0.2
    });
}

const init = () => {

    setActivePage(currentPage);
    initMenuListeners();
    initImageComparisonListeners();
    initFullscreenListeners();
    animateProjectDescription();
}


init();



