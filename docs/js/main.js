/**
 * Logistics AI Platform - Main JavaScript
 * Handles interactions, animations, and dynamic content
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initCounterAnimations();
    initAPIPreview();
    initTerminalAnimation();
    initSmoothScroll();
});

/**
 * Navigation Functionality
 */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close menu on link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

/**
 * Scroll-triggered Animations
 */
function initScrollAnimations() {
    // Check if GSAP and ScrollTrigger are available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Animate section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Animate feature cards
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Animate architecture nodes
    gsap.utils.toArray('.arch-node').forEach((node, i) => {
        gsap.from(node, {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            delay: i * 0.05,
            scrollTrigger: {
                trigger: node.parentElement,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Animate steps
    gsap.utils.toArray('.step').forEach((step, i) => {
        gsap.from(step, {
            x: -30,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.15,
            scrollTrigger: {
                trigger: step,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Parallax effect for floating cards
    gsap.utils.toArray('.floating-card').forEach((card, i) => {
        gsap.to(card, {
            y: -100,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });
    });
}

/**
 * Counter Animations
 */
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');

    const animateCounter = (counter) => {
        const target = parseFloat(counter.getAttribute('data-count'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        const isDecimal = target % 1 !== 0;

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * easeOut;

            if (isDecimal) {
                counter.textContent = current.toFixed(1);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    };

    // Use Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

/**
 * API Preview Tab Switching
 */
function initAPIPreview() {
    const categories = document.querySelectorAll('.api-category');
    const endpoints = document.querySelectorAll('.api-endpoints');

    categories.forEach(category => {
        category.addEventListener('click', () => {
            const targetCategory = category.getAttribute('data-category');

            // Update active states
            categories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');

            // Show corresponding endpoints
            endpoints.forEach(ep => {
                if (ep.getAttribute('data-category') === targetCategory) {
                    ep.classList.add('active');
                } else {
                    ep.classList.remove('active');
                }
            });
        });
    });
}

/**
 * Terminal Typing Animation
 */
function initTerminalAnimation() {
    const typingElements = document.querySelectorAll('.typing');

    typingElements.forEach(el => {
        const text = el.getAttribute('data-text');
        if (!text) return;

        let i = 0;
        el.textContent = '';

        const typeWriter = () => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };

        // Start typing when visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(typeWriter, 500);
                observer.disconnect();
            }
        });

        observer.observe(el);
    });

    // Animate terminal output lines
    const outputLines = document.querySelectorAll('.terminal-output .output-line');
    outputLines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(10px)';

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(() => {
                    line.style.transition = 'all 0.3s ease';
                    line.style.opacity = '1';
                    line.style.transform = 'translateY(0)';
                }, 800 + (i * 200));
                observer.disconnect();
            }
        });

        observer.observe(line.parentElement);
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Dynamic Background Gradient on Mouse Move
 */
document.addEventListener('mousemove', (e) => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    if (e.clientY > rect.bottom) return;

    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;

    hero.style.background = `
        radial-gradient(
            circle at ${x}% ${y}%,
            rgba(99, 102, 241, 0.08) 0%,
            transparent 50%
        ),
        linear-gradient(135deg, #f0f4ff 0%, #e8f4ff 50%, #f5f0ff 100%)
    `;
});

/**
 * Feature Card Hover Effects
 */
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

/**
 * Copy Code Button Functionality
 */
document.querySelectorAll('.code-block').forEach(block => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = 'Copy to clipboard';

    copyBtn.addEventListener('click', async () => {
        const code = block.textContent;
        try {
            await navigator.clipboard.writeText(code);
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });

    block.style.position = 'relative';
    block.appendChild(copyBtn);
});

/**
 * Lazy Load Images
 */
document.querySelectorAll('img[data-src]').forEach(img => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.disconnect();
            }
        });
    });

    observer.observe(img);
});

/**
 * Tooltip Functionality
 */
document.querySelectorAll('[data-tooltip]').forEach(el => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = el.getAttribute('data-tooltip');

    el.style.position = 'relative';

    el.addEventListener('mouseenter', () => {
        document.body.appendChild(tooltip);
        const rect = el.getBoundingClientRect();
        tooltip.style.cssText = `
            position: fixed;
            top: ${rect.top - 40}px;
            left: ${rect.left + rect.width / 2}px;
            transform: translateX(-50%);
            background: #1e1e2e;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            z-index: 10000;
            white-space: nowrap;
            animation: fadeIn 0.2s ease;
        `;
    });

    el.addEventListener('mouseleave', () => {
        tooltip.remove();
    });
});

// Add fadeIn animation for tooltips
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(5px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .copy-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: rgba(255, 255, 255, 0.6);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .copy-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.LogisticsAI = {
    initNavigation,
    initScrollAnimations,
    initCounterAnimations,
    initAPIPreview,
    initTerminalAnimation,
    initSmoothScroll
};
