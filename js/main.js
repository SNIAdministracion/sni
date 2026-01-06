document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initHeaderScroll();
    initCookieBanner();
    initMobileMenu();
    initSimpleMarquee(); // Restored interactive carousel
    initAnimations();
});

/**
 * 1. Navigation & Smooth Scroll
 */
const initNavigation = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
};

/**
 * 2. Header Scroll Effect
 */
const initHeaderScroll = () => {
    const header = document.querySelector('.header');
    if (!header) return;

    const toggleHeader = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // Initial check
    toggleHeader();

    // Passive listener for performance
    window.addEventListener('scroll', toggleHeader, { passive: true });
};

/**
 * 3. Cookie Banner
 */
const initCookieBanner = () => {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookies = document.getElementById('acceptCookies');

    if (cookieBanner && acceptCookies) {
        if (!localStorage.getItem('cookiesAccepted')) {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    cookieBanner.classList.add('active');
                });
            }, 1000);
        }

        acceptCookies.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieBanner.classList.remove('active');
        });
    }
};

/**
 * 4. Mobile Menu
 */
const initMobileMenu = () => {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            const isActive = mobileBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
    }
};

const closeMobileMenu = () => {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && mobileBtn.classList.contains('active')) {
        mobileBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }
};

/**
 * 5. Services Carousel (Infinite Loop)
 */
/**
 * 5. Services Carousel (Interactive Marquee)
 * Logic for Auto-Scroll + Drag + Touch + Hover Pause
 */
const initSimpleMarquee = () => {
    const slider = document.querySelector('.services-carousel-simple');
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let animationId;
    let isHovered = false;

    // --- Configuration ---
    const speed = 0.5; // Auto-scroll speed

    // --- Auto Scroll Loop ---
    const autoScroll = () => {
        if (!isHovered && !isDown) {
            slider.scrollLeft += speed;
        }

        // Infinite Loop Logic (Teleport)
        // Assumption: Content is doubled. If we scroll past half the track width, reset to 0.
        // We use scrollWidth / 2 roughly.
        // A more robust check: if scrollLeft >= (scrollWidth - clientWidth) / 2

        const maxScroll = slider.scrollWidth - slider.clientWidth;
        // If we have clones, we typically act when we hit the midpoint of "content"
        // But since we appended clones at the end equal to original set:
        // Real Content Width is approx slider.scrollWidth / 2.

        if (slider.scrollLeft >= (slider.scrollWidth / 2)) {
            slider.scrollLeft = 0; // Teleport back to start
            // Adjust slightly if needed for perfect smoothness, but 0 usually works if clones are exact
        }

        animationId = requestAnimationFrame(autoScroll);
    };

    // Start loop
    animationId = requestAnimationFrame(autoScroll);

    // --- Events for Drag / Pause ---

    // Mouse events
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active'); // CSS can use this for cursor: grabbing
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        cancelAnimationFrame(animationId); // Stop auto scroll while dragging
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        isHovered = false;
        slider.classList.remove('active');
        // Resume loop if not running? 
        // We actually want the loop running always, checking state. But we cancelled it.
        // Restart it.
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(autoScroll);
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(autoScroll);
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        slider.scrollLeft = scrollLeft - walk;
    });

    // Hover Pause (for reading)
    slider.addEventListener('mouseenter', () => {
        isHovered = true;
    });

    // Touch events (Native scroll handles most, but we want pause)
    slider.addEventListener('touchstart', () => {
        isDown = true;
        isHovered = true;
    }, { passive: true });

    slider.addEventListener('touchend', () => {
        isDown = false;
        // Optional: slight delay before resuming
        setTimeout(() => { isHovered = false; }, 1000);
    });
};

/**
 * 6. GSAP Animations & Hero Logic
 */
const initAnimations = () => {
    // Basic availability check
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    initHeroCarousel();
    initFlyingImage();
    initScrollTriggers();
    initHeroLogoParallax();
};

const initHeroLogoParallax = () => {
    const heroSection = document.querySelector('.hero');
    const logoBg = document.querySelector('.hero-logo-bg');

    if (!heroSection || !logoBg) return;

    // Use quickTo for high performance mouse tracking
    const xTo = gsap.quickTo(logoBg, "x", { duration: 0.8, ease: "power3", overwrite: "auto" });
    const yTo = gsap.quickTo(logoBg, "y", { duration: 0.8, ease: "power3", overwrite: "auto" });

    heroSection.addEventListener("mousemove", (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // Calculate center relative position (-0.5 to 0.5)
        const xPos = (clientX / innerWidth) - 0.5;
        const yPos = (clientY / innerHeight) - 0.5;

        // Move slightly (max 20px)
        xTo(xPos * 40);
        yTo(yPos * 40);
    });
};

const initHeroCarousel = () => {
    const heroCarouselItems = document.querySelectorAll('.hero-visual .carousel-item');
    if (heroCarouselItems.length === 0) return;

    const slots = ['slot-1', 'slot-2', 'slot-3'];
    let itemSlotIndices = [0, 1, 2];
    let carouselInterval;
    let isPaused = false;

    const rotateCarousel = () => {
        if (isPaused) return;

        // Rotation map
        itemSlotIndices = itemSlotIndices.map(s => {
            if (s === 1) return 0;
            if (s === 0) return 2;
            if (s === 2) return 1;
            return s;
        });

        heroCarouselItems.forEach((item, i) => {
            item.classList.remove('slot-1', 'slot-2', 'slot-3');
            item.classList.add(slots[itemSlotIndices[i]]);
        });
    };

    const startCarousel = () => {
        if (!carouselInterval) {
            carouselInterval = setInterval(rotateCarousel, 3000);
        }
    };

    const stopCarousel = () => {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
    };

    // Auto-start
    startCarousel();

    // Pause functionality controlled by scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            isPaused = true;
        } else {
            isPaused = false;
        }
    }, { passive: true });
};

const initFlyingImage = () => {
    const img = document.getElementById("anim-img");
    const startContainer = document.getElementById("hero-start-pos");
    const targetEl = document.getElementById("about-target-box");
    const visionCard = document.getElementById("vision-card");

    if (!img || !startContainer || !targetEl || !visionCard) return;

    // Ghost element to hold the space in the carousel
    // This allows us to "detach" the real image without breaking the layout
    let ghost = document.getElementById("anim-img-ghost");
    if (!ghost) {
        ghost = img.cloneNode(true);
        ghost.id = "anim-img-ghost";
        ghost.style.visibility = "hidden";
        ghost.style.position = "relative"; // Standard flow
        ghost.style.display = "none";      // Hidden by default
        ghost.removeAttribute("id");       // Prevent duplicate ID
        startContainer.insertBefore(ghost, img);
    }

    // State
    let isFixed = false;

    // --- Helpers ---
    const resetToCarousel = () => {
        if (img.parentElement !== startContainer) {
            startContainer.appendChild(img);
        }
        gsap.set(img, { clearProps: "position,top,left,width,height,zIndex,margin,transform,pointerEvents" });
        ghost.style.display = "none";
        isFixed = false;
    };

    const promoteToFixed = () => {
        if (isFixed) return;

        const rect = img.getBoundingClientRect();

        // Show ghost to fill slot
        ghost.style.display = "block";

        // Move img to body
        if (img.parentElement !== document.body) {
            document.body.appendChild(img);
        }

        gsap.set(img, {
            position: 'fixed',
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            margin: 0,
            zIndex: 100,
            pointerEvents: 'none'
        });
        isFixed = true;
    };

    ScrollTrigger.create({
        trigger: "#home",
        start: "top top",
        endTrigger: "#vision-card",
        end: "bottom center",
        scrub: 0.1, // Smooth scrub

        onUpdate: (self) => {
            const p = self.progress;

            // SAFETY RESET: If user scrolls back to the very top fast
            if (p <= 0.005) {
                if (isFixed) resetToCarousel();
                return;
            }

            // Ensure Fixed Mode
            promoteToFixed();

            // Calcs
            const startRect = ghost.getBoundingClientRect(); // Use Ghost for start config
            const targetRect = targetEl.getBoundingClientRect();
            const visionRect = visionCard.getBoundingClientRect();

            const startCX = startRect.left + startRect.width / 2;
            const startCY = startRect.top + startRect.height / 2;

            const targetCX = targetRect.left + targetRect.width / 2;
            const targetCY = targetRect.top + targetRect.height / 2;

            const split = 0.6;
            let cx, cy, w, h;

            if (p <= split) {
                // Phase 1 (Home -> About)
                const localP = p / split;
                const easeVal = gsap.parseEase("power1.inOut")(localP);

                cx = gsap.utils.interpolate(startCX, targetCX, easeVal);
                cy = gsap.utils.interpolate(startCY, targetCY, easeVal);
                w = gsap.utils.interpolate(startRect.width, targetRect.width, easeVal);
                h = gsap.utils.interpolate(startRect.height, targetRect.height, easeVal);
            } else {
                // Phase 2 (About -> Vision)
                const localP = (p - split) / (1 - split);

                cx = targetCX;
                w = targetRect.width;
                h = targetRect.height;
                const endCY = (visionRect.top + visionRect.height) - (h / 2);

                cy = gsap.utils.interpolate(targetCY, endCY, localP);
            }

            gsap.set(img, {
                left: cx - w / 2,
                top: cy - h / 2,
                width: w,
                height: h
            });
        },

        onLeave: () => {
            // Lock at end position
            const rect = img.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollLeft = window.scrollX || 0;

            gsap.set(img, {
                position: 'absolute',
                top: rect.top + scrollTop,
                left: rect.left + scrollLeft,
            });
            isFixed = false; // Critical: Signal that we are no longer fixed so promoteToFixed runs again on return
        },

        onLeaveBack: () => {
            resetToCarousel();
        }
    });
};

const initScrollTriggers = () => {
    // 1. Timeline Fill
    gsap.to('.timeline-fill', {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
            trigger: '#valuesTimeline',
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: true
        }
    });

    // 2. Value Items Reveal
    document.querySelectorAll('.value-row').forEach(row => {
        ScrollTrigger.create({
            trigger: row,
            start: 'top 70%',
            end: 'bottom 30%',
            toggleClass: 'active'
        });
    });

    // 3. Stacking Cards Entrance
    gsap.from('.stack-card', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.cards-container',
            start: 'top 85%'
        }
    });

    // 4. Parallax / Footer Reveal - Cleaned up
};

// Removed initParallaxSeparator as it's no longer used
