document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item, .slider-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');

    // --- Interactive Splash Screen ---
    const splashScreen = document.getElementById('splash-screen');
    const btnCanvas = document.getElementById('btn-canvas');
    const btnBlockchain = document.getElementById('btn-blockchain');
    const sketchbookSection = document.getElementById('sketchbook');

    if (splashScreen) {
        // Prevent scrolling while splash is active
        document.body.style.overflow = 'hidden';

        const hideSplash = () => {
            splashScreen.classList.add('fade-out');
            document.body.style.overflow = ''; // Restore scrolling
            // Remove from DOM after fade transition (600ms) to prevent blocking clicks
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 600);
        };

        if (btnBlockchain) {
            btnBlockchain.addEventListener('click', () => {
                hideSplash();
                // User stays at Hero section automatically since they are at the top
                window.scrollTo(0, 0);
            });
        }

        if (btnCanvas) {
            btnCanvas.addEventListener('click', () => {
                hideSplash();
                if (sketchbookSection) {
                    // Small delay to ensure scrolling logic kicks in after overflow is restored
                    setTimeout(() => {
                        sketchbookSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            });
        }
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

    // --- Dynamic Reviews & Stats (Firebase Firestore) ---
    const marqueeTrack = document.getElementById('marquee-track');
    const avgRatingEl = document.getElementById('avg-rating');
    const totalReviewsEl = document.getElementById('total-reviews');

    // Default base review (Castro) - used to seed Firestore if empty
    const defaultReview = {
        name: "Castro",
        handle: "@castronft36",
        link: "https://x.com/castronft36",
        rating: 5,
        comment: "The custom PFP was better than I imagined. Brought my brief to life flawlessly. Highly recommend grabbing a slot.",
        avatar: "https://unavatar.io/x/castronft36"
    };

    let reviews = [];

    const renderReviews = () => {
        if (!marqueeTrack || !avgRatingEl || !totalReviewsEl) return;

        if (reviews.length === 0) {
            avgRatingEl.innerText = "0.0";
            totalReviewsEl.innerText = "(0 Reviews)";
            marqueeTrack.innerHTML = '<div class="review-card"><p class="review-comment">Loading reviews...</p></div>';
            return;
        }

        // Calculate Stats
        let totalStars = 0;
        reviews.forEach(r => totalStars += parseInt(r.rating));
        const avg = totalStars / reviews.length;

        avgRatingEl.innerText = avg.toFixed(1);
        totalReviewsEl.innerText = `(${reviews.length} Review${reviews.length !== 1 ? 's' : ''})`;

        // Build HTML for cards
        const generateCardsHTML = () => {
            return reviews.map(r => `
                <div class="review-card">
                    <div class="review-stars">${'&#9733;'.repeat(r.rating)}</div>
                    <p class="review-comment">"${r.comment}"</p>
                    <div class="review-author">
                        <img src="${r.avatar}" alt="${r.name}" class="client-pfp" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'48\\' height=\\'48\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23eee\\'/></svg>'">
                        <div class="author-info">
                            <span class="author-name">${r.name}</span>
                            <a href="${r.link}" target="_blank" rel="noopener noreferrer" class="client-handle">${r.handle}</a>
                        </div>
                    </div>
                </div>
            `).join('');
        };

        const cardsHTML = generateCardsHTML();

        // Inject original set + duplicate set for seamless scrolling
        marqueeTrack.innerHTML = cardsHTML + cardsHTML;
    };

    // Show loading state immediately
    renderReviews();

    // --- Load reviews from Firestore when Firebase is ready ---
    const initFirebaseReviews = async () => {
        const db = window.firebaseDB;
        const { collection, getDocs, addDoc, query, orderBy, serverTimestamp } = window.firebaseTools;

        try {
            // Fetch all reviews from Firestore, ordered by timestamp
            const reviewsRef = collection(db, 'reviews');
            const q = query(reviewsRef, orderBy('timestamp', 'asc'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // Seed Firestore with the default Castro review
                await addDoc(reviewsRef, {
                    ...defaultReview,
                    timestamp: serverTimestamp()
                });
                reviews = [defaultReview];
            } else {
                reviews = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        name: data.name,
                        handle: data.handle,
                        link: data.link,
                        rating: data.rating,
                        comment: data.comment,
                        avatar: data.avatar
                    };
                });
            }

            renderReviews();
        } catch (error) {
            console.error("Error loading reviews from Firestore:", error);
            // Fallback to default review if Firestore fails
            reviews = [defaultReview];
            renderReviews();
        }
    };

    // Listen for Firebase ready event
    if (window.firebaseDB) {
        initFirebaseReviews();
    } else {
        window.addEventListener('firebase-ready', initFirebaseReviews);
    }

    // --- Interactive Star Rating ---
    const starContainer = document.getElementById('star-rating-input');
    const ratingInput = document.getElementById('rating-value');
    if (starContainer && ratingInput) {
        const stars = starContainer.querySelectorAll('.star');

        stars.forEach(star => {
            star.addEventListener('mouseover', function () {
                const value = parseInt(this.getAttribute('data-value'));
                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-value')) <= value) s.classList.add('hovered');
                    else s.classList.remove('hovered');
                });
            });

            starContainer.addEventListener('mouseleave', function () {
                stars.forEach(s => s.classList.remove('hovered'));
            });

            star.addEventListener('click', function () {
                const value = parseInt(this.getAttribute('data-value'));
                ratingInput.value = value;

                // Update selected classes
                stars.forEach(s => {
                    const sValue = parseInt(s.getAttribute('data-value'));
                    if (sValue <= value) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            });
        });
    }

    // --- Review Form Submission (Firebase Firestore) ---
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const rating = parseInt(ratingInput.value);
            if (rating === 0) {
                alert("Please provide a star rating!");
                return;
            }

            const nameInput = document.getElementById('reviewer-name').value;
            const socialInput = document.getElementById('reviewer-social').value;
            const commentInput = document.getElementById('reviewer-comment').value;

            // Extract handle from URL, or fallback to name
            let handle = socialInput.split('/').pop();
            handle = handle ? '@' + handle : '@' + nameInput.replace(/\s+/g, '').toLowerCase();

            const newReview = {
                name: nameInput,
                handle: handle,
                link: socialInput,
                rating: rating,
                comment: commentInput,
                avatar: `https://unavatar.io/x/${handle.replace('@', '')}`
            };

            const submitBtn = reviewForm.querySelector('.submit-review-btn');
            const originalText = submitBtn.innerText;

            submitBtn.innerText = "Submitting...";
            submitBtn.style.opacity = "0.7";
            submitBtn.disabled = true;

            try {
                // Save to Firestore
                const db = window.firebaseDB;
                const { collection, addDoc, serverTimestamp } = window.firebaseTools;

                await addDoc(collection(db, 'reviews'), {
                    ...newReview,
                    timestamp: serverTimestamp()
                });

                // Add to local array and re-render
                reviews.push(newReview);
                renderReviews();

                submitBtn.innerText = "Review Submitted! ✓";
                submitBtn.style.background = "#DCAE96";
                submitBtn.style.opacity = "1";

                reviewForm.reset();
                ratingInput.value = "0";
                starContainer.querySelectorAll('.star').forEach(s => {
                    s.classList.remove('selected');
                    s.classList.remove('hovered');
                });

                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.style.background = "";
                    submitBtn.disabled = false;
                }, 3000);

            } catch (error) {
                console.error("Error saving review to Firestore:", error);
                submitBtn.innerText = "Error — try again";
                submitBtn.style.background = "#e74c3c";
                submitBtn.style.opacity = "1";

                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.style.background = "";
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

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

    // --- Terms & Conditions Modal ---
    const serviceCtas = document.querySelectorAll('.service-cta');
    const termsModal = document.getElementById('terms-modal');
    const rejectBtn = document.getElementById('reject-terms');
    const acceptBtn = document.getElementById('accept-terms');
    let currentServiceLink = '';

    if (termsModal && rejectBtn && acceptBtn) {
        serviceCtas.forEach(cta => {
            cta.addEventListener('click', (e) => {
                e.preventDefault();
                currentServiceLink = cta.getAttribute('href');
                termsModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeTerms = () => {
            termsModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            currentServiceLink = '';
        };

        rejectBtn.addEventListener('click', closeTerms);

        acceptBtn.addEventListener('click', () => {
            termsModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            if (currentServiceLink) {
                window.open(currentServiceLink, '_blank', 'noopener,noreferrer');
            }
        });

        // Close on clicking outside modal content
        termsModal.addEventListener('click', (e) => {
            if (e.target === termsModal) closeTerms();
        });
    }
});
