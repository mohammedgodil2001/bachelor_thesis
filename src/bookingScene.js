
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import videoOptimizedSrc from './images/video_optimized.mp4';
import googleMeetIcon from './images/google_meet.png';
import teamsIcon from './images/teams.png';
import zoomIcon from './images/zoom.png';

gsap.registerPlugin(ScrollTrigger);

export const initBookingScene = (overlay) => { // Accept overlay instance
    const section = document.querySelector('#third-and-fourth-scene');
    const videoWrapper = document.querySelector('#video-wrapper');
    const video = videoWrapper.querySelector('video');
    const bookingSection = document.querySelector('.booking-section');
    const headsetOverlay = document.getElementById('headset-overlay');
    const headsetImage = document.getElementById('headset-image');
    const headsetPopup = document.getElementById('headset-popup');

    // New element references
    const interestedScreen = document.getElementById('interestedScreen');
    const formScreen = document.getElementById('formScreen');
    const discoverBtn = document.getElementById('discoverBtn');
    const videoPreview = document.querySelector('.form-video-preview');

    if (!section || !videoWrapper || !video) return;

    // Handle initial visibility
    if (interestedScreen && formScreen) {
        interestedScreen.classList.add('active');
        formScreen.classList.remove('active');
        formScreen.style.display = 'none'; // Ensure it's hidden from layout

        // Hide video preview initially
        if (videoPreview) {
            videoPreview.style.display = 'none';
        }
        
    }

    // --- Scroll Interception Logic ---
    let isTransitionEnabled = false; // Debounce flag

    // Helper to determine if we should block scroll
    const isAtTop = (el) => el.scrollTop <= 5;
    const isAtBottom = (el) => el.scrollHeight - el.scrollTop - el.clientHeight <= 5;

    // 1. Interested Screen Logic
    const handleInterestedWheel = (e) => {
        if (!interestedScreen.classList.contains('active')) return;
        
        // Handle Scrolling Back Up (Unlock)
        if (e.deltaY < 0) {
            // Re-enable Lenis so standard scrolling (and ScrollTrigger scrub) works
            if (window.lenis) window.lenis.start();
            // Allow event to propagate so Lenis/Browser handles it
            return;
        }
        
        // Prevent accidental triggers
        if (!isTransitionEnabled) {
            // Block everything aggressively
            if (e.deltaY > 0) {
                 e.preventDefault();
                 e.stopImmediatePropagation();
            }
            return;
        }

        if (e.deltaY > 0) {
            e.preventDefault(); 
            e.stopImmediatePropagation(); 
            triggerToForm();
        }
    };

    const handleInterestedTouch = (e) => {
         if (!interestedScreen.classList.contains('active')) return;
         
         const touch = e.touches[0];
         if (!interestedScreen.touchStartY) interestedScreen.touchStartY = touch.clientY;
         
         const diff = interestedScreen.touchStartY - touch.clientY;
         
         if (diff > 50) { 
             if (!isTransitionEnabled) return; // Ignore if cooling down
             
             if (e.cancelable) e.preventDefault();
             e.stopPropagation();
             triggerToForm();
             interestedScreen.touchStartY = null; 
         }
    };
    
    // 2. Form Screen Logic
    const handleFormWheel = (e) => {
        if (!formScreen.classList.contains('active')) return;

        // Detect Up AND At Top
        if (e.deltaY < 0 && isAtTop(formScreen)) {
             e.preventDefault(); 
             e.stopPropagation(); 
             triggerToInterested();
        }
    };

    const handleFormTouch = (e) => {
        if (!formScreen.classList.contains('active')) return;
         const touch = e.touches[0];
         if (!formScreen.touchStartY) formScreen.touchStartY = touch.clientY;
         
         const diff = formScreen.touchStartY - touch.clientY;
         
         if (diff < -50 && isAtTop(formScreen)) { 
             if (e.cancelable) e.preventDefault();
             e.stopPropagation();
             triggerToInterested();
             formScreen.touchStartY = null;
         }
    };

    // Attach Listeners with { passive: false }
    interestedScreen.addEventListener('wheel', handleInterestedWheel, { passive: false });
    interestedScreen.addEventListener('touchstart', (e) => interestedScreen.touchStartY = e.touches[0].clientY, { passive: true });
    interestedScreen.addEventListener('touchmove', handleInterestedTouch, { passive: false });

    formScreen.addEventListener('wheel', handleFormWheel, { passive: false });
    formScreen.addEventListener('touchstart', (e) => formScreen.touchStartY = e.touches[0].clientY, { passive: true });
    formScreen.addEventListener('touchmove', handleFormTouch, { passive: false });


    const triggerToForm = () => {
        if (overlay.isAnimating) return;
        overlay.isAnimating = true;

        if (window.lenis) window.lenis.stop();

        overlay.DOM.el.classList.add('white-mode');

        overlay.show({
            duration: 0.4,
            ease: 'power3.inOut',
            stagger: index => 0.02 * (overlay.cells.flat()[index].row + gsap.utils.random(0, 5))
        }).then(() => {
            interestedScreen.classList.remove('active');
            interestedScreen.style.display = 'none';
            
            formScreen.style.display = 'flex'; 
            formScreen.classList.add('active'); 

            // Show video preview
            if (videoPreview) {
                videoPreview.style.display = 'block';
                // Small delay or autoAlpha if you want animation, but block is sufficient for "visible"
                // ensure it's on top if needed, typically it is by DOM order
            }

            overlay.hide({
                duration: 0.4,
                ease: 'power2',
                stagger: index => 0.02 * (overlay.cells.flat()[index].row + gsap.utils.random(0, 5))
            }).then(() => {
                overlay.DOM.el.classList.remove('white-mode'); 
                overlay.isAnimating = false;
                if (window.lenis) window.lenis.start();

                // Ensure form can scroll if needed
                formScreen.scrollTop = 0;
            });
        });
    };

    const triggerToInterested = () => {
         if (overlay.isAnimating) return;
        overlay.isAnimating = true;

        if (window.lenis) window.lenis.stop();
        
        overlay.DOM.el.classList.add('white-mode');

        overlay.show({
             duration: 0.4,
             ease: 'power3.inOut',
             stagger: index => 0.02 * (overlay.cells.flat()[index].row + gsap.utils.random(0, 5))
        }).then(() => {
             formScreen.classList.remove('active');
             formScreen.style.display = 'none';

             // Hide video preview
            if (videoPreview) {
                 videoPreview.style.display = 'none';
            }

             interestedScreen.style.display = 'flex'; 
             interestedScreen.classList.add('active');
             
             // IMPORTANT: Give a small delay before enabling forward transition again
             // to prevent accidental bounces if scrolling fast up
             isTransitionEnabled = false;
             setTimeout(() => { isTransitionEnabled = true; }, 800);

             overlay.hide({
                 duration: 0.4,
                 ease: 'power2',
                 stagger: index => 0.02 * (overlay.cells.flat()[index].row + gsap.utils.random(0, 5))
             }).then(() => {
                 overlay.DOM.el.classList.remove('white-mode'); 
                 overlay.isAnimating = false;
                 if (window.lenis) window.lenis.start();
             });
        });
    };

    // Set video source
    video.src = videoOptimizedSrc;

    // Initial state
    gsap.set(videoWrapper, { opacity: 0, pointerEvents: 'none' }); 
    gsap.set(headsetOverlay, { opacity: 0, pointerEvents: 'none' });
    gsap.set(headsetImage, { opacity: 0, pointerEvents: 'none' });
    gsap.set(headsetPopup, { opacity: 0, pointerEvents: 'none' });
    gsap.set(bookingSection, { opacity: 0, pointerEvents: 'none' });

    // Headset checkpoint state
    let isHeadsetUnlocked = false;
    let hasPopupAnimated = false;
    // Dynamic checkpoint based on fullscreen state
    const getCheckpoint = () => document.fullscreenElement ? 0.642 : 0.645;
    const BUFFER = 0.002;

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
        const headsetText = headsetPopup?.querySelector('.popup-part-text span');
        if (headsetText) {
             overlayTexts['headset'] = new SplitType(headsetText, { types: 'words, chars' });
             gsap.set(overlayTexts['headset'].chars, { opacity: 0, y: 8, visibility: 'hidden' });
        }
    };

    // Animate typing effect for headset popup
    const animateHeadsetTyping = () => {
        if (!overlayTexts['headset'] || hasPopupAnimated) return;
        
        const split = overlayTexts['headset'];
        if (!split || !split.chars) return;
        
        gsap.fromTo(split.chars, 
            { opacity: 0, y: 8, visibility: 'visible' },
            { 
                opacity: 1, 
                y: 0, 
                autoAlpha: 1, 
                duration: 0.03,
                stagger: 0.015, 
                ease: 'power1.out',
                overwrite: true
            }
        );
        hasPopupAnimated = true;
    };

    initTextOverlays();

    // Handle scroll update with checkpoint logic
    const handleScrollUpdate = (self) => {
        const progress = self.progress;



        // Headset checkpoint logic
        if (headsetOverlay && headsetImage && headsetPopup) {
            if (isHeadsetUnlocked) {
                // UNLOCKED STATE: Strictly hide headset
                headsetOverlay.style.opacity = '0';
                headsetOverlay.style.visibility = 'hidden';
                headsetImage.style.opacity = '0';
                headsetImage.style.visibility = 'hidden';
                headsetImage.style.pointerEvents = 'none';
                headsetPopup.style.opacity = '0';
                headsetPopup.style.visibility = 'hidden';
                headsetPopup.style.pointerEvents = 'none';
                
                // Re-lock if scrolling back significantly
                if (!ScrollTrigger.isRefreshing && progress < getCheckpoint() - BUFFER) {
                    isHeadsetUnlocked = false;
                    hasPopupAnimated = false;
                }
            } else {
                // LOCKED STATE LOGIC
                // Show headset when at or near checkpoint
                // Show headset when at or near checkpoint
                if (progress >= getCheckpoint() - BUFFER) {
                    // Show headset
                    headsetOverlay.style.opacity = '1';
                    headsetOverlay.style.visibility = 'visible';
                    headsetImage.style.opacity = '1';
                    headsetImage.style.visibility = 'visible';
                    headsetImage.style.pointerEvents = 'auto';
                    headsetPopup.style.opacity = '1';
                    headsetPopup.style.visibility = 'visible';
                    headsetPopup.style.pointerEvents = 'auto';
                    
                    // Block forward scroll at checkpoint
                    if (progress > getCheckpoint() && !isHeadsetUnlocked) {
                        const targetScroll = self.start + (self.end - self.start) * getCheckpoint();
                        if (window.lenis) {
                            window.lenis.scrollTo(targetScroll, { 
                                immediate: true, 
                                lock: true 
                            });
                        } else {
                            window.scrollTo(0, targetScroll);
                        }
                    } else if (window.lenis) {
                        // Ensure lenis is running if not blocked
                        window.lenis.start();
                    }
                    
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                    
                    if (!hasPopupAnimated) {
                        animateHeadsetTyping();
                    }
                } else {
                    // Hide headset when below checkpoint
                    headsetOverlay.style.opacity = '0';
                    headsetOverlay.style.visibility = 'hidden';
                    headsetImage.style.opacity = '0';
                    headsetImage.style.visibility = 'hidden';
                    headsetImage.style.pointerEvents = 'none';
                    headsetPopup.style.opacity = '0';
                    headsetPopup.style.visibility = 'hidden';
                    headsetPopup.style.pointerEvents = 'none';
                    hasPopupAnimated = false;
                }
            }
        }
    };

    // Headset click handler to unlock scrolling
    const handleHeadsetClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isHeadsetUnlocked) return; // Already unlocked
        
        isHeadsetUnlocked = true;
        
        // Restore scrolling
        if (window.lenis) {
            window.lenis.start();
        }
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        // Hide headset
        if (headsetOverlay) {
            headsetOverlay.style.opacity = '0';
        }
        if (headsetImage) {
            headsetImage.style.opacity = '0';
            headsetImage.style.pointerEvents = 'none';
        }
        if (headsetPopup) {
            headsetPopup.style.opacity = '0';
            headsetPopup.style.pointerEvents = 'none';
        }
        
        // Force scroll past checkpoint
        const scrollTrigger = ScrollTrigger.getById('booking-scene-trigger');
        if (scrollTrigger) {
            const targetProgress = getCheckpoint() + 0.01; // Just past checkpoint
            const targetScroll = scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * targetProgress;
            if (window.lenis) {
                window.lenis.scrollTo(targetScroll, { immediate: false });
            } else {
                window.scrollTo(0, targetScroll);
            }
        }
    };

    // Attach click handler only to the headset image (not the container)
    if (headsetImage) {
        headsetImage.addEventListener('click', handleHeadsetClick);
        headsetImage.style.cursor = 'pointer';
    }
    
    // Ensure overlay container never blocks clicks
    if (headsetOverlay) {
        headsetOverlay.style.pointerEvents = 'none';
    }

    // Store scroll trigger reference
    let scrollTriggerInstance = null;

    // --- Main Timeline ---
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            id: 'booking-scene-trigger',
            onUpdate: function(self) {
                if (ScrollTrigger.isRefreshing || window.isNavigating) return;
                handleScrollUpdate(self);
                
                // Prevent scrolling past checkpoint if not unlocked
                if (!isHeadsetUnlocked && self.progress > getCheckpoint()) {
                    const checkpointPos = self.start + (self.end - self.start) * getCheckpoint();
                    // Only prevent if trying to scroll forward
                    const currentScroll = window.scrollY || window.pageYOffset;
                    if (currentScroll > checkpointPos - 5) {
                        // Force scroll back to checkpoint
                        if (window.lenis) {
                            window.lenis.scrollTo(checkpointPos, { immediate: true });
                        } else {
                            window.scrollTo(0, checkpointPos);
                        }
                    }
                }
            },
            onEnter: () => {
                video.pause();
            },
            onLeaveBack: () => {
                // Prevent state reset during refresh OR if already unlocked
                if (ScrollTrigger.isRefreshing || isHeadsetUnlocked) return;
                
                video.currentTime = 0;
                video.pause();
                // Reset headset state
                isHeadsetUnlocked = false;
                hasPopupAnimated = false;
            }
        }
    });
    
    scrollTriggerInstance = ScrollTrigger.getById('booking-scene-trigger');
    
    // Smart State Preservation for Booking Scene Checkpoint
    // This handles the shift between 0.645 (Normal) and 0.642 (Fullscreen)
    // ensuring the user stays "locked" if they were at the checkpoint.
    let savedState = {
        wasLockedAtCheckpoint: false,
        progress: null
    };

    ScrollTrigger.addEventListener("refreshInit", () => {
        const st = ScrollTrigger.getById('booking-scene-trigger');
        if (st && st.isActive) {
            savedState.progress = st.progress;
            
            // Check if user was effectively "at the checkpoint" (locked)
            // We use a broad range (0.63 - 0.66) to catch either 0.642 or 0.645
            const isNearCheckpoint = st.progress > 0.63 && st.progress < 0.66;
            savedState.wasLockedAtCheckpoint = !isHeadsetUnlocked && isNearCheckpoint;
        } else {
            savedState.progress = null;
        }
    });

    ScrollTrigger.addEventListener("refresh", () => {
        if (savedState.progress !== null) {
            const st = ScrollTrigger.getById('booking-scene-trigger');
            if (st) {
                let targetProgress = savedState.progress;
                
                // If we were locked at the old checkpoint, SNAP to the new checkpoint
                if (savedState.wasLockedAtCheckpoint) {
                    targetProgress = getCheckpoint();
                }

                const newScroll = st.start + (st.end - st.start) * targetProgress;
                
                if (window.lenis) {
                    window.lenis.scrollTo(newScroll, { immediate: true });
                } else {
                    window.scrollTo(0, newScroll);
                }
            }
        }
    });

    // 1. Fade in video wrapper - Reduced duration to start video sooner
    timeline.to(videoWrapper, { opacity: 1, duration: 0.1, ease: "power2.inOut" });

    // Label for the main sequence start
    timeline.add('sequenceStart');

    // 2. Video Scrubbing
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

    // 3. Add text overlay animations
    const addTextOverlaySequence = (tl, startLabel) => {
         const overlays = document.querySelectorAll('[data-overlay-id]');
         const sortedOverlays = Array.from(overlays).sort((a, b) => a.dataset.overlayId - b.dataset.overlayId);

         const animateTextIn = (id) => {
             const split = overlayTexts[id];
             if(!split || !split.chars) return; 
             
             gsap.fromTo(split.chars, 
                 { opacity: 0, y: 8, visibility: 'visible' },
                 { 
                     opacity: 1, 
                     y: 0, 
                     autoAlpha: 1, 
                     duration: 0.03,
                     stagger: 0.015, 
                     ease: 'power1.out',
                     overwrite: true
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
           .to(sortedOverlays[2], { opacity: 0, duration: 0.5 }, `${startLabel}+=10.8`);

         // Text 4
         tl.to(sortedOverlays[3], { 
                opacity: 1, 
                duration: 0.1,
                onStart: () => animateTextIn('4')
            }, `${startLabel}+=11.2`)
           .to(sortedOverlays[3], { opacity: 0, duration: 0.5 }, `${startLabel}+=13.7`);
    };

    addTextOverlaySequence(timeline, 'sequenceStart');

    // 4. Fade out video at the end - REMOVED to fix reverse transition issues (seamless reveal)
    // timeline.to(videoWrapper, { opacity: 0, duration: 1, ease: "power2.inOut" }, 'sequenceStart+=15');

    // 5. Show Booking Form
    // Also hide header and scroll hint to match reference
    const header = document.querySelector('header');
    const actionHint = document.querySelector('.action-hint');
    
    // Use the timeline position 'sequenceStart+=15' directly since we removed the previous tween
    timeline.to(bookingSection, { 
        opacity: 1, 
        duration: 1,
        // Manage pointerEvents dynamically to handle scrub vs interaction
        onUpdate: function() {
             const p = this.progress(); 
             if (p > 0.99) {
                 bookingSection.style.pointerEvents = 'auto';
             } else {
                 bookingSection.style.pointerEvents = 'none';
                 // Don't disable transition here, let it be controlled by logic
             }
        },
        onComplete: () => {
             // Lock global scroll and enable custom transition
             if (window.lenis) window.lenis.stop();
             bookingSection.style.pointerEvents = 'auto';
             
             // Start Cooldown
             setTimeout(() => { isTransitionEnabled = true; }, 100);
        }
    }, 'sequenceStart+=15');
    
    
    if (actionHint) {
        timeline.to(actionHint, { opacity: 0, duration: 0.5 }, "<");
    }


    // --- Carousel Logic ---
    const initCarousel = () => {
        const track = document.getElementById('carouselTrack');
        if (!track) return;

        const slides = Array.from(track.children);
        const nextButton = document.getElementById('carouselRight');
        const prevButton = document.getElementById('carouselLeft');
        const dotsNav = document.querySelector('.carousel-dots');
        const dots = Array.from(dotsNav.children);

        let currentIndex = 0;

        const updateCarousel = (index) => {
            // Update Slides
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');

            // Update Dots
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');

            currentIndex = index;
        };

        const goToNextSlide = (e) => {
             if(e) {
                 e.preventDefault();
                 e.stopPropagation();
             }
             const nextIndex = (currentIndex + 1) % slides.length;
             updateCarousel(nextIndex);
        };

        const goToPrevSlide = (e) => {
             if(e) {
                 e.preventDefault();
                 e.stopPropagation();
             }
             const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
             updateCarousel(prevIndex);
        };

        // Event Listeners
        if(nextButton) nextButton.addEventListener('click', goToNextSlide);
        if(prevButton) prevButton.addEventListener('click', goToPrevSlide);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                updateCarousel(index);
            });
        });

        // Optional: Keyboard navigation if section is active (could be added later)
    };

    // Initialize the carousel
    initCarousel();

    // Initialize Booking Form Functionality
    initBookingForm();
};

// Booking Form Functionality
const initBookingForm = () => {
    let selectedDuration = 15;
    let selectedDate = null;
    let selectedTime = null;
    let currentMonth = new Date();
    let is24HourFormat = false;
    let currentStep = 1;

    const form = document.getElementById('bookingForm');
    const formScreen = document.getElementById('formScreen');
    const confirmationScreen = document.getElementById('confirmationScreen');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const errorMessage = document.getElementById('errorMessage');
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthDisplay = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const selectedDay = document.getElementById('selectedDay');
    const selectedDateText = document.getElementById('selectedDateText');
    const timeSlots = document.getElementById('timeSlots');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const stepIndicators = document.querySelectorAll('.step-number');

    const platformIcons = {
        'google_meet': googleMeetIcon,
        'teams': teamsIcon,
        'zoom': zoomIcon
    };

    const platformNames = {
        'google_meet': 'Google Meet',
        'teams': 'Microsoft Teams',
        'zoom': 'Zoom'
    };

    const durationLabels = {
        15: '15m',
        30: '30m',
        45: '45m',
        60: '1h'
    };

    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Duration buttons
    function handleDurationClick(btn) {
        document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDuration = parseInt(btn.dataset.duration);
        if (selectedDate) generateTimeSlots();
    }

    function initializeDurationButtons() {
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDurationClick(btn));
        });
        const firstBtn = document.querySelector('.duration-btn[data-duration="15"]');
        if (firstBtn) firstBtn.classList.add('active');
    }

    // Toggle buttons (12h/24h)
    function handleToggleClick(btn) {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        is24HourFormat = btn.dataset.hours === '24';
        if (selectedDate) generateTimeSlots();
    }

    function initializeToggleButtons() {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => handleToggleClick(btn));
        });
    }

    // Calendar navigation
    function handlePrevMonth() {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    }

    function handleNextMonth() {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    }

    function initializeCalendarNavigation() {
        if (prevMonthBtn) prevMonthBtn.addEventListener('click', handlePrevMonth);
        if (nextMonthBtn) nextMonthBtn.addEventListener('click', handleNextMonth);
    }

    // Calendar rendering
    function getFirstDayOfWeek(year, month) {
        const firstDay = new Date(year, month, 1);
        let firstDayOfWeek = firstDay.getDay() - 1;
        if (firstDayOfWeek === -1) firstDayOfWeek = 6;
        return firstDayOfWeek;
    }

    function getLastDayOfMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getTodayDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    function createDayElement(day, isDisabled, date) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        if (isDisabled) {
            dayElement.classList.add('disabled');
        } else {
            dayElement.addEventListener('click', () => selectDate(date, dayElement));
        }
        return dayElement;
    }

    function renderCalendar() {
        if (!calendarDays || !currentMonthDisplay) return;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
        const numDays = getLastDayOfMonth(year, month);
        const firstDayOfWeek = getFirstDayOfWeek(year, month);
        const today = getTodayDate();
        calendarDays.innerHTML = '';

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const dayElement = createDayElement(day, true, null);
            dayElement.classList.add('other-month');
            calendarDays.appendChild(dayElement);
        }

        // Current month days
        for (let day = 1; day <= numDays; day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const isPast = date < today;
            const isToday = date.getTime() === today.getTime();
            const dayElement = createDayElement(day, isPast, date);
            if (isToday) dayElement.classList.add('today');
            if (selectedDate && date.getTime() === selectedDate.getTime()) {
                dayElement.classList.add('selected');
            }
            calendarDays.appendChild(dayElement);
        }

        // Next month days
        const totalCells = calendarDays.children.length;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true, null);
            dayElement.classList.add('other-month');
            calendarDays.appendChild(dayElement);
        }
    }

    // Date selection
    function updateSelectedDateDisplay(date) {
        if (!selectedDay || !selectedDateText || !selectedDateDisplay) return;
        selectedDay.textContent = dayNames[date.getDay()];
        selectedDateText.textContent = date.toLocaleDateString('en-US', { day: 'numeric' }) + 'th';
        selectedDateDisplay.classList.remove('hidden');
    }

    function clearCalendarSelection() {
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
    }

    function selectDate(date, element) {
        selectedDate = date;
        selectedTime = null;
        clearCalendarSelection();
        element.classList.add('selected');
        updateSelectedDateDisplay(date);
        generateTimeSlots();
        validateStep2();
    }

    // Time slots
    function formatTime(hour, minute) {
        if (is24HourFormat) {
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        } else {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
            return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        }
    }

    function handleTimeSlotClick(slot, hour, minute) {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        selectedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        console.log('Time Selected:', selectedTime);
        validateStep2();
    }

    function createTimeSlot(timeString, hour, minute) {
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.classList.add('time-slot');
        slot.textContent = timeString;
        slot.dataset.hour = hour;
        slot.dataset.minute = minute;
        slot.addEventListener('click', () => handleTimeSlotClick(slot, hour, minute));
        return slot;
    }

    function generateTimeSlots() {
        if (!timeSlots || !selectedDate) return;
        timeSlots.innerHTML = '';
        timeSlots.classList.remove('hidden');

        const startHour = 9;
        const endHour = 17;
        let interval;
        if (selectedDuration === 15) interval = 15;
        else if (selectedDuration === 30) interval = 30;
        else if (selectedDuration === 45) interval = 30;
        else if (selectedDuration === 60) interval = 60;

        const allSlots = [];
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                let endMinute = minute + selectedDuration;
                let endHourCalc = hour;
                if (endMinute >= 60) {
                    endHourCalc = hour + Math.floor(endMinute / 60);
                    endMinute = endMinute % 60;
                }
                if (endHourCalc < endHour || (endHourCalc === endHour && endMinute === 0)) {
                    allSlots.push({ hour, minute });
                }
            }
        }

        const dateString = selectedDate.toDateString();
        const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const seededRandom = (s) => {
            const x = Math.sin(s++) * 10000;
            return x - Math.floor(x);
        };

        let currentSeed = seed;
        const numberOfSlots = Math.floor(seededRandom(currentSeed) * 2) + 4;
        currentSeed++;
        const shuffledSlots = [...allSlots].sort(() => {
            const val = seededRandom(currentSeed++) - 0.5;
            return val;
        });

        const slotsToShow = shuffledSlots.slice(0, Math.min(numberOfSlots, allSlots.length));
        slotsToShow.sort((a, b) => {
            if (a.hour !== b.hour) return a.hour - b.hour;
            return a.minute - b.minute;
        });

        slotsToShow.forEach(({ hour, minute }) => {
            const timeString = formatTime(hour, minute);
            const slot = createTimeSlot(timeString, hour, minute);
            if (selectedTime) {
                const [selectedH, selectedM] = selectedTime.split(':').map(Number);
                if (selectedH === hour && selectedM === minute) {
                    slot.classList.add('selected');
                }
            }
            timeSlots.appendChild(slot);
        });
    }

    // Form validation
    function validateStep1() {
        const fullName = document.getElementById('fullName')?.value.trim();
        const workEmail = document.getElementById('workEmail')?.value.trim();
        const companyName = document.getElementById('companyName')?.value.trim();
        const isValid = fullName && workEmail && companyName;
        if (nextBtn) nextBtn.disabled = !isValid;
        return isValid;
    }

    function validateStep2() {
        const isValid = selectedDate && selectedTime;
        console.log('Validating Step 2:', { selectedDate, selectedTime, isValid });
        if (submitBtn) {
            submitBtn.disabled = !isValid;
            // Visual force update
            if (isValid) submitBtn.classList.remove('disabled');
            else submitBtn.classList.add('disabled');
        }
        return isValid;
    }

    function updateStepIndicators(step) {
        stepIndicators.forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            // Check for internal spans (added for Step 1)
            const numSpan = indicator.querySelector('.number');
            const iconSpan = indicator.querySelector('.check-icon');

            if (stepNum < step) {
                // Completed Step
                indicator.classList.add('completed');
                if (numSpan && iconSpan) {
                    numSpan.classList.add('hidden');
                    iconSpan.classList.remove('hidden');
                }
            } else if (stepNum === step) {
                // Current Active Step
                indicator.classList.add('active');
                if (numSpan && iconSpan) {
                    numSpan.classList.remove('hidden');
                    iconSpan.classList.add('hidden');
                }
            } else {
                // Future Step
                if (numSpan && iconSpan) {
                    numSpan.classList.remove('hidden');
                    iconSpan.classList.add('hidden');
                }
            }
        });

        // Manage Back Button Visibility
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            if (step > 1) {
                backBtn.classList.remove('hidden');
            } else {
                backBtn.classList.add('hidden');
            }
        }
    }

    // Step navigation
    function goToNextStep() {
        if (!validateStep1()) return;
        currentStep = 2;
        if (step1) step1.classList.remove('active');
        if (step2) step2.classList.add('active');
        updateStepIndicators(2);
        
        // Add step-2-view class to navigation container
        const navContainer = document.querySelector('.step-navigation-container');
        if (navContainer) navContainer.classList.add('step-2-view');
        
        validateStep2();
    }

    function goToPrevStep() {
        currentStep = 1;
        if (step2) step2.classList.remove('active');
        if (step1) step1.classList.add('active');
        updateStepIndicators(1);
        
        // Remove step-2-view class from navigation container
        const navContainer = document.querySelector('.step-navigation-container');
        if (navContainer) navContainer.classList.remove('step-2-view');
        
        validateStep1();
    }

    // Form submission
    function getFormData() {
        return {
            full_name: document.getElementById('fullName')?.value.trim() || '',
            work_email: document.getElementById('workEmail')?.value.trim() || '',
            company_name: document.getElementById('companyName')?.value.trim() || '',
            message: document.getElementById('message')?.value.trim() || '',
            meeting_duration: selectedDuration,
            meeting_platform: document.getElementById('meetingPlatform')?.value || '',
            timezone: document.getElementById('timezone')?.value || '',
            meeting_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
            meeting_time: selectedTime || '',
            created_at: new Date().toISOString()
        };
    }

    function showLoadingState() {
        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Booking...';
        if (btnLoader) btnLoader.classList.remove('hidden');
    }

    function hideLoadingState() {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Book meeting';
        if (btnLoader) btnLoader.classList.add('hidden');
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = `Error: ${message}`;
            errorMessage.classList.remove('hidden');
        }
    }

    function hideError() {
        if (errorMessage) errorMessage.classList.add('hidden');
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        hideError();
        showLoadingState();
        const formData = getFormData();
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Booking data (not actually saved):', formData);
            showConfirmation(formData);
        } catch (error) {
            console.error('Error booking meeting:', error);
            showError(error.message);
            hideLoadingState();
        }
    }

    // Confirmation screen
    function formatConfirmationDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function updateConfirmationScreen(data) {
        const dateStr = formatConfirmationDate(data.meeting_date);
        const dateTimeEl = document.getElementById('confirmDateTime');
        const durationEl = document.getElementById('confirmDuration');
        const platformEl = document.getElementById('confirmPlatform');
        const platformIconEl = document.getElementById('confirmPlatformIcon');
        const timezoneEl = document.getElementById('confirmTimezone');

        console.log('Update Confirmation Screen with data:', data);
        
        if (dateTimeEl) {
            dateTimeEl.textContent = `${dateStr} - ${data.meeting_time.slice(0, 5)}`;
            console.log('Set DateTime:', dateTimeEl.textContent);
        } else console.warn('dateTimeEl not found');

        if (durationEl) {
            durationEl.textContent = durationLabels[data.meeting_duration];
            console.log('Set Duration:', durationEl.textContent);
        } else console.warn('durationEl not found');

        if (platformEl) platformEl.textContent = platformNames[data.meeting_platform];
        if (platformIconEl) platformIconEl.src = platformIcons[data.meeting_platform];
        if (timezoneEl) timezoneEl.textContent = `( UTC+0 )${data.timezone}`;
    }

    function switchToConfirmationScreen() {
        if (formScreen) formScreen.classList.remove('active');
        if (confirmationScreen) confirmationScreen.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.querySelector('#video-wrapper')?.style.setProperty('display', 'none');
        // REMOVED: document.querySelector('#third-and-fourth-scene')?.style.setProperty('display', 'none');
        // ScrollTrigger.getAll().forEach(st => st.kill()); // REMOVED: This breaks the scene on reset
        const bookingSection = document.querySelector('.booking-section');
        if (bookingSection) {
            bookingSection.style.opacity = '1';
            bookingSection.style.pointerEvents = 'auto';
            bookingSection.classList.add('visible');
        }
    }

    function showConfirmation(data) {
        updateConfirmationScreen(data);
        switchToConfirmationScreen();
    }

    // Platform change handler
    function handlePlatformChange(e) {
        const selectedPlatform = e.target.value;
        const iconElement = document.getElementById('platformIcon');
        if (iconElement) iconElement.src = platformIcons[selectedPlatform];
    }

    // Initialize all
    function initialize() {
        initializeDurationButtons();
        initializeToggleButtons();
        initializeCalendarNavigation();
        renderCalendar();

        // Form validation
        ['fullName', 'workEmail', 'companyName'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.addEventListener('input', validateStep1);
        });

        // Step navigation
        const backBtnNew = document.getElementById('backBtn'); // Get the new button
        if (nextBtn) nextBtn.addEventListener('click', goToNextStep);
        if (backBtn) backBtn.addEventListener('click', goToPrevStep); // Old one if exists
        if (backBtnNew) backBtnNew.addEventListener('click', goToPrevStep); // New specific one

        // Form submission - Changed to manual click for robustness
        // if (form) form.addEventListener('submit', handleFormSubmit);
        if (submitBtn) {
            submitBtn.type = 'button'; // Prevent default submit
            submitBtn.addEventListener('click', handleFormSubmit);
        }

        // Platform change
        const platformSelect = document.getElementById('meetingPlatform');
        if (platformSelect) platformSelect.addEventListener('change', handlePlatformChange);

        // Initial validation
        validateStep1();
    }

    // Video preview expand functionality
    function initVideoPreview() {
        const previewContainer = document.querySelector('.form-video-preview');
        if (!previewContainer) return;

        const videoContainer = previewContainer.querySelector('.video-container');
        const video = previewContainer.querySelector('video');
        const expandBtn = previewContainer.querySelector('.video-expand-btn');
        const closeBtn = previewContainer.querySelector('.corner-tr');

        if (!videoContainer || !video) return;

        const marker = previewContainer.cloneNode(false);
        marker.classList.add('ghost-marker');
        marker.style.display = 'block'; // Ensure it has layout even if cloned from hidden element
        marker.style.visibility = 'hidden';
        marker.style.pointerEvents = 'none';
        marker.style.opacity = '0';
        marker.style.transition = 'none';
        marker.innerHTML = '';
        previewContainer.parentNode?.insertBefore(marker, previewContainer);

        const backdrop = document.createElement('div');
        backdrop.classList.add('video-preview-backdrop');
        document.body.appendChild(backdrop);

        video.muted = true;
        video.loop = true;
        video.play().catch(() => {});

        let isAnimating = false;

        const toggleExpand = (e) => {
            e.stopPropagation();
            if (isAnimating) return;
            const isExpanded = previewContainer.classList.contains('expanded');
            isAnimating = true;

            if (!isExpanded) {
                const startRect = previewContainer.getBoundingClientRect();
                backdrop.classList.add('active');
                document.body.appendChild(previewContainer);
                previewContainer.style.position = 'fixed';
                previewContainer.style.top = startRect.top + 'px';
                previewContainer.style.left = startRect.left + 'px';
                previewContainer.style.width = startRect.width + 'px';
                previewContainer.style.height = startRect.height + 'px';
                previewContainer.style.transition = 'none';
                previewContainer.offsetHeight;

                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const aspectRatio = 250 / 120;
                let targetW = vw * 0.9;
                let targetH = targetW / aspectRatio;
                if (targetH > vh * 0.9) {
                    targetH = vh * 0.9;
                    targetW = targetH * aspectRatio;
                }
                const targetTop = (vh - targetH) / 2;
                const targetLeft = (vw - targetW) / 2;

                previewContainer.classList.add('expanded');
                previewContainer.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                previewContainer.style.top = targetTop + 'px';
                previewContainer.style.left = targetLeft + 'px';
                previewContainer.style.width = targetW + 'px';
                previewContainer.style.height = targetH + 'px';

                video.currentTime = 0;
                video.muted = false;
                video.loop = true;
                video.controls = true;
                video.load();
                video.play().catch(() => {});
                previewContainer.style.cursor = 'default'; // Reset cursor
                setTimeout(() => { isAnimating = false; }, 500);
            } else {
                backdrop.classList.remove('active');
                const targetRect = marker.getBoundingClientRect();
                previewContainer.classList.remove('expanded');
                previewContainer.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                previewContainer.style.top = targetRect.top + 'px';
                previewContainer.style.left = targetRect.left + 'px';
                previewContainer.style.width = targetRect.width + 'px';
                previewContainer.style.height = targetRect.height + 'px';

                video.muted = true;
                video.controls = false;

                setTimeout(() => {
                    if (marker.parentNode) {
                        marker.parentNode.insertBefore(previewContainer, marker);
                    }
                    previewContainer.style.transition = 'none';
                    previewContainer.style.position = '';
                    previewContainer.style.top = '';
                    previewContainer.style.left = '';
                    previewContainer.style.width = '';
                    previewContainer.style.height = '';
                    video.load();
                    video.muted = true;
                    video.loop = true;
                    video.play().catch(() => {});
                    isAnimating = false;
                    previewContainer.style.cursor = 'pointer'; // Restore pointer
                    requestAnimationFrame(() => { previewContainer.style.transition = ''; });
                }, 500);
            }
        };

        backdrop.addEventListener('click', () => {
            if (previewContainer.classList.contains('expanded')) toggleExpand({ stopPropagation: () => {} });
        });

        if (expandBtn) {
            // Remove specific listener, let bubbling handle it via container
            expandBtn.style.pointerEvents = 'none'; // distinct visual cue if needed
        }
        
        // Add click listener to the entire container
        previewContainer.style.cursor = 'pointer';
        previewContainer.addEventListener('click', (e) => {
             // Only allow opening interactions from the container click
             if (!previewContainer.classList.contains('expanded')) {
                 toggleExpand(e);
             }
        });

        if (closeBtn) closeBtn.addEventListener('click', (e) => {
            if (previewContainer.classList.contains('expanded')) {
                e.stopPropagation();
                toggleExpand(e);
            }
        });
    }

    // Initialize everything
    initialize();
    initVideoPreview();

    // Global reset function for confirmation screen
    // Global reset function for confirmation screen
    window.resetForm = function() {
        // Reset form fields
        if (form) form.reset();
        selectedDate = null;
        selectedTime = null;
        selectedDuration = 15;
        currentStep = 1;
        is24HourFormat = false;

        // Reset UI
        document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
        const firstDurationBtn = document.querySelector('.duration-btn[data-duration="15"]');
        if (firstDurationBtn) firstDurationBtn.classList.add('active');

        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        const firstToggleBtn = document.querySelector('.toggle-btn[data-hours="12"]');
        if (firstToggleBtn) firstToggleBtn.classList.add('active');

        if (selectedDateDisplay) selectedDateDisplay.classList.add('hidden');
        if (timeSlots) {
            timeSlots.classList.add('hidden');
            timeSlots.innerHTML = '';
        }

        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Book meeting';
        if (btnLoader) btnLoader.classList.add('hidden');
        if (errorMessage) errorMessage.classList.add('hidden');

        // Reset platform icon
        const platformIcon = document.getElementById('platformIcon');
        if (platformIcon) platformIcon.src = platformIcons['google_meet'];

        // Switch back to form screen
        if (confirmationScreen) {
            confirmationScreen.classList.remove('active');
            confirmationScreen.style.display = 'none'; // Ensure confirmation is hidden
        }
        if (formScreen) {
            formScreen.classList.add('active');
            formScreen.style.display = 'flex'; // Explicitly restore display to override potential 'none'
        }
        if (interestedScreen) {
            interestedScreen.classList.remove('active');
            interestedScreen.style.display = 'none';
        }

        // Restore scroll
        document.body.style.overflow = '';
        document.querySelector('#video-wrapper')?.style.setProperty('display', 'block');
        document.querySelector('#third-and-fourth-scene')?.style.setProperty('display', 'block');

        // Force GSAP to recognize the layout change instantly prevents scroll lag
        ScrollTrigger.refresh();

        // Ensure Lenis is restarted if it was stopped
        if (window.lenis) window.lenis.start();

        // Reset to step 1
        if (step2) step2.classList.remove('active');
        if (step1) step1.classList.add('active');
        updateStepIndicators(1);

        // Reset step view classes
        const navContainer = document.querySelector('.step-navigation-container');
        if (navContainer) navContainer.classList.remove('step-2-view');

        // Reset calendar
        currentMonth = new Date();
        renderCalendar();

        // Re-initialize animation if needed
        // Scroll to bottom (Using Lenis if available)
        const targetScroll = document.body.scrollHeight;
        if (window.lenis) {
            window.lenis.scrollTo(targetScroll, { immediate: true });
        } else {
            window.scrollTo(0, targetScroll);
        }
    };
};
