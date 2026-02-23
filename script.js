document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item, .slider-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');

    // --- Sidebar Navigation ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    const openSidebar = () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    };

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('visible');
        document.body.style.overflow = 'auto';
    };

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Close sidebar on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // Close sidebar when a nav link is clicked
    if (sidebar) {
        sidebar.querySelectorAll('.sidebar-links a').forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    }

    // --- Lightbox (on slideshow or gallery pages) ---
    if (lightbox && lightboxImg && closeBtn) {
        const closeLightbox = () => {
            lightbox.classList.remove('show');
            setTimeout(() => { lightboxImg.src = ''; }, 300);
            document.body.style.overflow = 'auto';
        };

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('show')) closeLightbox();
        });

        // Click gallery items to open lightbox (sketchbook grid)
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgEl = item.querySelector('img');
                lightboxImg.src = imgEl.src.replace('&w=800', '&w=1600');
                lightbox.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        });
    }

    // --- Responsive Sliders (Auto-Scroll, Arrows, Smart Pause) ---
    const sliderWrappers = document.querySelectorAll('.slider-wrapper');

    sliderWrappers.forEach(wrapper => {
        const slider = wrapper.querySelector('.slider');
        const prevBtn = wrapper.querySelector('.slider-prev');
        const nextBtn = wrapper.querySelector('.slider-next');
        let autoPlayTimer;

        if (!slider) return;

        // Auto-scroll logic
        const scrollNext = () => {
            const itemWidth = slider.querySelector('.slider-item').offsetWidth + 20; // Include gap
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            // If we are at the end, jump back to start, else scroll right
            if (slider.scrollLeft >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: itemWidth, behavior: 'smooth' });
            }
        };

        const startAutoPlay = () => {
            // Scroll every 3 seconds per user request
            autoPlayTimer = setInterval(scrollNext, 3000);
        };

        const resetAutoPlay = () => {
            clearInterval(autoPlayTimer);
            startAutoPlay();
        };

        // Arrow Navigation
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                const itemWidth = slider.querySelector('.slider-item').offsetWidth + 20;
                slider.scrollBy({ left: -itemWidth, behavior: 'smooth' });
                resetAutoPlay();
            });
            nextBtn.addEventListener('click', () => {
                const itemWidth = slider.querySelector('.slider-item').offsetWidth + 20;
                slider.scrollBy({ left: itemWidth, behavior: 'smooth' });
                resetAutoPlay();
            });
        }

        // Start playing immediately
        startAutoPlay();

        // Smart Pause on Hover / Touch
        wrapper.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
        wrapper.addEventListener('mouseleave', startAutoPlay);
        wrapper.addEventListener('touchstart', () => clearInterval(autoPlayTimer), { passive: true });
        wrapper.addEventListener('touchend', startAutoPlay);
    });

    // --- Staggered Fade-In for gallery items (sketchbook) ---
    galleryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 50)); // Stagger by 50ms

        // Remove inline transition styles after animation completes so hover works
        setTimeout(() => {
            item.style.transition = 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease';
        }, 1000 + (index * 50));
    });

    // --- Click Splash Effect (works on ALL pages) ---
    document.addEventListener('click', (e) => {
        const mark = document.createElement('div');
        mark.classList.add('click-mark');
        mark.style.left = e.clientX + 'px';
        mark.style.top = e.clientY + 'px';
        document.body.appendChild(mark);
        // Remove after animation completes
        mark.addEventListener('animationend', () => mark.remove());
    });
});

