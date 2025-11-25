// import './style.css'
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';



// gsap.registerPlugin(ScrollTrigger);



// const menuToggle = document.getElementById('menuToggle');
// const closeMenu = document.getElementById('closeMenu');
// const menuOverlay = document.getElementById('menuOverlay');
// const menuLinks = document.querySelectorAll('.menu-link');
// const menuTexts = document.querySelectorAll('.menu-text');


// let isMenuOpen = false;


// let menuTimeline;


// const currentPage = 'physical'; 
// setActivePage(currentPage);


// menuToggle.addEventListener('click', () => {
//     if (isMenuOpen) {
//         closeMenuFunc();
//     } else {
//         openMenu();
//     }
// });

// function openMenu() {
//     if (isMenuOpen) return;
    
//     isMenuOpen = true;
//     menuToggle.style.pointerEvents = 'none';
    
    
//     const activeLine = document.querySelector('.menu-link.active .menu-line');
//     if (activeLine) {
//         gsap.set(activeLine, { scaleX: 0 });
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
    
    
//     menuTimeline.to(['.system-settings', '.menu-footer'], {
//         opacity: 1,
//         y: 0,
//         duration: 0.6,
//         stagger: 0.1,
//         ease: 'power2.out'
//     }, '-=0.4');
// }



// closeMenu.addEventListener('click', closeMenuFunc);


// function closeMenuFunc() {
//     if (!isMenuOpen) return;
    
//     // Create close timeline
//     const closeTimeline = gsap.timeline({
//         onComplete: () => {
//             isMenuOpen = false;
//             menuToggle.style.pointerEvents = 'auto';
//             menuOverlay.classList.remove('menu-open');
//         }
//     });
    
//     // Hide decorations first
//     closeTimeline.to(['.system-settings', '.menu-footer'], {
//         opacity: 0,
//         y: 30,
//         duration: 0.3,
//         ease: 'power2.in'
//     });
    
//     // Hide text items - make them go DOWN
//     closeTimeline.to(menuTexts, {
//         y: '150%',
//         opacity: 0,
//         duration: 0.6,
//         stagger: 0.05,
//         ease: 'expo.in'
//     }, '-=0.1');
    
//     // Slide out menu TO THE RIGHT
//     closeTimeline.to(menuOverlay, {
//         x: '100%',  /* Changed from x: '-100%' */
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

// function openMenu() {
//     if (isMenuOpen) return;
    
//     isMenuOpen = true;
    
//     // Convert hamburger to X
//     menuToggle.classList.add('active-menu');
    
//     const activeLine = document.querySelector('.menu-link.active .menu-line');
//     if (activeLine) {
//         gsap.set(activeLine, { scaleX: 0 });
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


function openMenu() {
    if (isMenuOpen) return;
    
    isMenuOpen = true;
    
    // Convert hamburger to X
    menuToggle.classList.add('active-menu');
    
    const activeLine = document.querySelector('.menu-link.active .menu-line');
    if (activeLine) {
        // Reset BOTH scaleX and Y position
        gsap.set(activeLine, { 
            scaleX: 0,
            y: '0%',      // ADD THIS - Reset Y position
            opacity: 1    // ADD THIS - Reset opacity
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
            
            // Convert X back to hamburger
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