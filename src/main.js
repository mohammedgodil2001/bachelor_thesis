// import './style.css'
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// const menuToggle = document.getElementById('menuToggle');
// const menuOverlay = document.getElementById('menuOverlay');
// const menuLinks = document.querySelectorAll('.menu-link');
// const menuTexts = document.querySelectorAll('.menu-text');

// let isMenuOpen = false;
// let menuTimeline;

// const currentPage = 'physical'; 
// setActivePage(currentPage);

// // Toggle menu on hamburger click
// menuToggle.addEventListener('click', (e) => {
//     e.preventDefault();
    
//     if (isMenuOpen) {
//         closeMenuFunc();
//     } else {
//         openMenu();
//     }
// });



// function openMenu() {
//     if (isMenuOpen) return;
    
//     isMenuOpen = true;
    
//     // Convert hamburger to X
//     menuToggle.classList.add('active-menu');
    
//     const activeLine = document.querySelector('.menu-link.active .menu-line');
//     if (activeLine) {
//         // Reset BOTH scaleX and Y position
//         gsap.set(activeLine, { 
//             scaleX: 0,
//             y: '0%',      // ADD THIS - Reset Y position
//             opacity: 1    // ADD THIS - Reset opacity
//         });
//     }
    
//     menuTimeline = gsap.timeline();
    
//     menuTimeline.to(menuOverlay, {
//         x: '0%',
//         duration: 1.8,
//         ease: 'expo.inOut'
//     });
    
//     menuOverlay.classList.add('menu-open');
    
//     menuTimeline.to(menuTexts, {
//         y: '0%',
//         opacity: 1,
//         duration: 0.8,
//         stagger: 0.1,
//         ease: 'expo.out'
//     }, '-=0.2');
    
//     if (activeLine) {
//         menuTimeline.to(activeLine, {
//             scaleX: 1,
//             duration: 0.8,
//             ease: 'expo.inOut'
//         }, '-=0.6');
//     }
// }


// function closeMenuFunc() {
//     if (!isMenuOpen) return;
    
//     const closeTimeline = gsap.timeline({
//         onComplete: () => {
//             isMenuOpen = false;
//             menuOverlay.classList.remove('menu-open');
            
//             // Convert X back to hamburger
//             menuToggle.classList.remove('active-menu');
//         }
//     });
    
//     const activeLine = document.querySelector('.menu-link.active .menu-line');
    
//     closeTimeline.to(menuTexts, {
//         y: '150%',
//         opacity: 0,
//         duration: 0.6,
//         stagger: 0.05,
//         ease: 'expo.in'
//     });
    
//     if (activeLine) {
//         closeTimeline.to(activeLine, {
//             y: '150%',
//             opacity: 0,
//             duration: 0.6,
//             ease: 'expo.in'
//         }, 0);
//     }
    
//     closeTimeline.to(menuOverlay, {
//         x: '100%',
//         duration: 1,
//         ease: 'expo.inOut'
//     }, '-=0.4');
// }

// menuLinks.forEach(link => {
//     link.addEventListener('click', (e) => {
//         const page = link.getAttribute('data-page');
        
//         if (link.classList.contains('active')) {
//             closeMenuFunc();
//             return;
//         }
        
//         const currentActiveLine = document.querySelector('.menu-link.active .menu-line');
//         const newLink = link;
//         const newLine = newLink.querySelector('.menu-line');
        
//         menuLinks.forEach(l => l.classList.remove('active'));
//         newLink.classList.add('active');
        
//         const lineTransition = gsap.timeline({
//             onComplete: () => {
//                 closeMenuFunc();
//             }
//         });
        
//         if (currentActiveLine && currentActiveLine !== newLine) {
//             lineTransition.to(currentActiveLine, {
//                 scaleX: 0,
//                 duration: 0.4,
//                 ease: 'expo.inOut'
//             });
//         }
        
//         lineTransition.to(newLine, {
//             scaleX: 1,
//             duration: 0.5,
//             ease: 'expo.inOut'
//         }, currentActiveLine && currentActiveLine !== newLine ? '-=0.2' : 0);
        
//         console.log('Navigate to:', page);
//     });
// });

// function setActivePage(page) {
//     menuLinks.forEach(link => {
//         link.classList.remove('active');
//         const line = link.querySelector('.menu-line');
//         gsap.set(line, { scaleX: 0 });
//     });
    
//     const activeLink = document.querySelector(`[data-page="${page}"]`);
//     if (activeLink) {
//         activeLink.classList.add('active');
//     }
// }

// document.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape' && isMenuOpen) {
//         closeMenuFunc();
//     }
// });



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
setActivePage(currentPage);

// Toggle menu on hamburger click
menuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (isMenuOpen) {
        closeMenuFunc();
    } else {
        openMenu();
    }
});

function openMenu() {
    if (isMenuOpen) return;
    
    isMenuOpen = true;
    
    // Convert hamburger to X
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

function closeMenuFunc() {
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

menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
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
            onComplete: () => {
                closeMenuFunc();
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
    });
});

function setActivePage(page) {
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
        closeMenuFunc();
    }
});




const container = document.querySelector('.comparison-container');
const topImage = document.querySelector('.top-image');
const revealSquare = document.querySelector('.reveal-square');
const lines = {
  top: document.querySelector('.line-top'),
  right: document.querySelector('.line-right'),
  bottom: document.querySelector('.line-bottom'),
  left: document.querySelector('.line-left')
};

if (container && topImage && revealSquare) {
    let mouseX = 0;
    let mouseY = 0;
    const squareSize = 100;
    let ticking = false;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        if (!ticking) {
            requestAnimationFrame(() => {
                updateRevealEffect(mouseX, mouseY);
                ticking = false;
            });
            ticking = true;
        }
    });

    container.addEventListener('mouseleave', () => {
        topImage.style.clipPath = 'inset(100% 100% 100% 100%)';
    });


// function updateRevealEffect(x, y) {
//     const halfSize = squareSize / 2;

//     const width = container.offsetWidth;
//     const height = container.offsetHeight;

//     // Clamp inside container
//     const safeX = Math.max(halfSize, Math.min(width - halfSize, x));
//     const safeY = Math.max(halfSize, Math.min(height - halfSize, y));

//     // Round everything to remove sub-pixel jitter
//     const left = Math.round(safeX - halfSize);
//     const right = Math.round(safeX + halfSize);
//     const top = Math.round(safeY - halfSize);
//     const bottom = Math.round(safeY + halfSize);

//     // ✅ Move square using absolute positioning (not transform)
//     revealSquare.style.left = `${left}px`;
//     revealSquare.style.top = `${top}px`;

//     // ✅ Apply clean clip-path
//     topImage.style.clipPath = `inset(
//         ${top}px 
//         ${width - right}px 
//         ${height - bottom}px 
//         ${left}px
//     )`;

  
// if (lines.top) {
//     lines.top.style.top = `${top}px`;
//     lines.top.style.left = `0px`;
//     lines.top.style.width = `${left}px`;
// }

// if (lines.left) {
//     lines.left.style.left = `${left}px`;
//     lines.left.style.top = `0px`;
//     lines.left.style.height = `${top}px`;
// }



// if (lines.bottom) {
//     lines.bottom.style.top = `${bottom}px`;
//     lines.bottom.style.left = `${right}px`;
//     lines.bottom.style.width = `${width - right}px`;
// }

// if (lines.right) {
//     lines.right.style.left = `${right}px`;
//     lines.right.style.top = `${bottom}px`;
//     lines.right.style.height = `${height - bottom}px`;
// }


    
// }



function updateRevealEffect(x, y) {
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



}


