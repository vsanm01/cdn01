/**
 * HeroSlider.js v1.0.0
 * Advanced responsive image carousel with touch support
 * Usage: new HeroSlider('#slider-container', options)
 */

(function(global) {
    'use strict';

    class HeroSlider {
        constructor(selector, options = {}) {
            this.container = typeof selector === 'string' 
                ? document.querySelector(selector) 
                : selector;
            
            if (!this.container) {
                console.error('HeroSlider: Container not found');
                return;
            }

            // Default options
            this.options = {
                images: options.images || [],
                autoPlay: options.autoPlay !== false,
                interval: options.interval || 5000,
                transitionDuration: options.transitionDuration || 600,
                showArrows: options.showArrows !== false,
                showDots: options.showDots !== false,
                pauseOnHover: options.pauseOnHover !== false,
                loop: options.loop !== false,
                swipe: options.swipe !== false,
                effect: options.effect || 'slide', // slide, fade, zoom
                height: options.height || '500px',
                objectFit: options.objectFit || 'cover',
                lazyLoad: options.lazyLoad !== false,
                preloadNext: options.preloadNext !== false,
                keyboard: options.keyboard !== false,
                arrowStyle: options.arrowStyle || 'default', // default, circle, square
                dotStyle: options.dotStyle || 'default', // default, line, square
                onSlideChange: options.onSlideChange || null,
                onInit: options.onInit || null
            };

            this.currentIndex = 0;
            this.isTransitioning = false;
            this.autoPlayTimer = null;
            this.touchStartX = 0;
            this.touchEndX = 0;

            this.init();
        }

        init() {
            if (this.options.images.length === 0) {
                console.warn('HeroSlider: No images provided');
                return;
            }

            this.render();
            this.attachEvents();
            
            if (this.options.autoPlay) {
                this.startAutoPlay();
            }

            if (this.options.preloadNext) {
                this.preloadImages();
            }

            if (this.options.onInit) {
                this.options.onInit(this);
            }
        }

        render() {
            // Create slider structure
            this.container.innerHTML = `
                <div class="hero-slider-wrapper" style="position: relative; width: 100%; height: ${this.options.height}; overflow: hidden; border-radius: 8px;">
                    <div class="hero-slider-track" style="position: relative; width: 100%; height: 100%; display: flex; transition: transform ${this.options.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1);">
                        ${this.renderSlides()}
                    </div>
                    ${this.options.showArrows ? this.renderArrows() : ''}
                    ${this.options.showDots ? this.renderDots() : ''}
                    <div class="hero-slider-counter" style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.6); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; backdrop-filter: blur(10px);">
                        <span class="current">${this.currentIndex + 1}</span> / <span class="total">${this.options.images.length}</span>
                    </div>
                </div>
            `;

            this.track = this.container.querySelector('.hero-slider-track');
            this.slides = this.container.querySelectorAll('.hero-slide');
            this.dots = this.container.querySelectorAll('.hero-dot');
            this.counter = this.container.querySelector('.hero-slider-counter .current');
            
            this.applyEffect();
        }

        renderSlides() {
            return this.options.images.map((img, index) => `
                <div class="hero-slide" data-index="${index}" style="min-width: 100%; height: 100%; position: relative; flex-shrink: 0;">
                    <img src="${this.options.lazyLoad && index > 0 ? '' : img.url || img}" 
                         data-src="${img.url || img}"
                         alt="${img.alt || `Slide ${index + 1}`}"
                         style="width: 100%; height: 100%; object-fit: ${this.options.objectFit}; display: block;"
                         loading="${index === 0 ? 'eager' : 'lazy'}">
                    ${img.caption ? `
                        <div class="hero-caption" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; padding: 40px 30px 30px; transform: translateY(100%); transition: transform 0.3s ease;">
                            <h2 style="font-size: 32px; margin: 0 0 10px; font-weight: 700;">${img.title || ''}</h2>
                            <p style="font-size: 18px; margin: 0; opacity: 0.9;">${img.caption}</p>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        renderArrows() {
            const arrowStyles = {
                default: 'border-radius: 50%; width: 50px; height: 50px;',
                circle: 'border-radius: 50%; width: 60px; height: 60px; border: 2px solid white;',
                square: 'border-radius: 8px; width: 50px; height: 50px;'
            };

            const style = arrowStyles[this.options.arrowStyle] || arrowStyles.default;

            return `
                <button class="hero-arrow hero-prev" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; ${style} cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: all 0.3s; backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="hero-arrow hero-next" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; ${style} cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: all 0.3s; backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            `;
        }

        renderDots() {
            const dotStyles = {
                default: 'width: 12px; height: 12px; border-radius: 50%;',
                line: 'width: 40px; height: 4px; border-radius: 2px;',
                square: 'width: 12px; height: 12px; border-radius: 2px;'
            };

            const style = dotStyles[this.options.dotStyle] || dotStyles.default;

            return `
                <div class="hero-dots" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 10;">
                    ${this.options.images.map((_, index) => `
                        <button class="hero-dot ${index === 0 ? 'active' : ''}" data-index="${index}" 
                                style="${style} background: ${index === 0 ? 'white' : 'rgba(255,255,255,0.5)'}; border: none; cursor: pointer; transition: all 0.3s;">
                        </button>
                    `).join('')}
                </div>
            `;
        }

        applyEffect() {
            if (this.options.effect === 'fade') {
                this.track.style.display = 'block';
                this.slides.forEach((slide, index) => {
                    slide.style.position = 'absolute';
                    slide.style.top = '0';
                    slide.style.left = '0';
                    slide.style.opacity = index === 0 ? '1' : '0';
                    slide.style.transition = `opacity ${this.options.transitionDuration}ms ease`;
                });
            }
        }

        attachEvents() {
            // Arrow navigation
            const prevBtn = this.container.querySelector('.hero-prev');
            const nextBtn = this.container.querySelector('.hero-next');
            
            if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
            if (nextBtn) nextBtn.addEventListener('click', () => this.next());

            // Arrow hover effects
            [prevBtn, nextBtn].forEach(btn => {
                if (btn) {
                    btn.addEventListener('mouseenter', (e) => {
                        e.target.style.background = 'rgba(255,255,255,1)';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    });
                    btn.addEventListener('mouseleave', (e) => {
                        e.target.style.background = 'rgba(255,255,255,0.9)';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                    });
                }
            });

            // Dot navigation
            if (this.dots) {
                this.dots.forEach(dot => {
                    dot.addEventListener('click', (e) => {
                        const index = parseInt(e.target.dataset.index);
                        this.goToSlide(index);
                    });
                });
            }

            // Pause on hover
            if (this.options.pauseOnHover) {
                this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
                this.container.addEventListener('mouseleave', () => {
                    if (this.options.autoPlay) this.startAutoPlay();
                });
            }

            // Touch/Swipe support
            if (this.options.swipe) {
                this.container.addEventListener('touchstart', (e) => {
                    this.touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                this.container.addEventListener('touchend', (e) => {
                    this.touchEndX = e.changedTouches[0].screenX;
                    this.handleSwipe();
                }, { passive: true });

                // Mouse drag
                let isDragging = false;
                let startX = 0;

                this.container.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startX = e.pageX;
                    this.container.style.cursor = 'grabbing';
                });

                this.container.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                });

                this.container.addEventListener('mouseup', (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    this.container.style.cursor = 'grab';
                    
                    const diff = e.pageX - startX;
                    if (Math.abs(diff) > 50) {
                        if (diff > 0) this.prev();
                        else this.next();
                    }
                });

                this.container.addEventListener('mouseleave', () => {
                    isDragging = false;
                    this.container.style.cursor = 'default';
                });
            }

            // Keyboard navigation
            if (this.options.keyboard) {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft') this.prev();
                    if (e.key === 'ArrowRight') this.next();
                });
            }

            // Show caption on slide hover
            this.slides.forEach(slide => {
                const caption = slide.querySelector('.hero-caption');
                if (caption) {
                    slide.addEventListener('mouseenter', () => {
                        caption.style.transform = 'translateY(0)';
                    });
                    slide.addEventListener('mouseleave', () => {
                        caption.style.transform = 'translateY(100%)';
                    });
                }
            });
        }

        handleSwipe() {
            const swipeThreshold = 50;
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) this.next();
                else this.prev();
            }
        }

        goToSlide(index) {
            if (this.isTransitioning) return;
            if (!this.options.loop && (index < 0 || index >= this.options.images.length)) return;

            this.isTransitioning = true;
            this.currentIndex = index;

            if (index < 0) this.currentIndex = this.options.images.length - 1;
            if (index >= this.options.images.length) this.currentIndex = 0;

            if (this.options.effect === 'fade') {
                this.slides.forEach((slide, i) => {
                    slide.style.opacity = i === this.currentIndex ? '1' : '0';
                });
            } else if (this.options.effect === 'zoom') {
                this.slides.forEach((slide, i) => {
                    if (i === this.currentIndex) {
                        slide.style.transform = 'scale(1)';
                        slide.style.opacity = '1';
                    } else {
                        slide.style.transform = 'scale(0.8)';
                        slide.style.opacity = '0';
                    }
                });
            } else {
                // Default slide effect
                this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
            }

            // Update dots
            if (this.dots) {
                this.dots.forEach((dot, i) => {
                    if (i === this.currentIndex) {
                        dot.classList.add('active');
                        dot.style.background = 'white';
                        if (this.options.dotStyle === 'line') {
                            dot.style.width = '40px';
                        } else {
                            dot.style.transform = 'scale(1.2)';
                        }
                    } else {
                        dot.classList.remove('active');
                        dot.style.background = 'rgba(255,255,255,0.5)';
                        if (this.options.dotStyle === 'line') {
                            dot.style.width = '40px';
                        } else {
                            dot.style.transform = 'scale(1)';
                        }
                    }
                });
            }

            // Update counter
            if (this.counter) {
                this.counter.textContent = this.currentIndex + 1;
            }

            // Lazy load current image
            if (this.options.lazyLoad) {
                const currentSlide = this.slides[this.currentIndex];
                const img = currentSlide.querySelector('img');
                if (img && !img.src && img.dataset.src) {
                    img.src = img.dataset.src;
                }
            }

            setTimeout(() => {
                this.isTransitioning = false;
            }, this.options.transitionDuration);

            if (this.options.onSlideChange) {
                this.options.onSlideChange(this.currentIndex, this);
            }
        }

        next() {
            this.goToSlide(this.currentIndex + 1);
        }

        prev() {
            this.goToSlide(this.currentIndex - 1);
        }

        startAutoPlay() {
            this.stopAutoPlay();
            this.autoPlayTimer = setInterval(() => {
                this.next();
            }, this.options.interval);
        }

        stopAutoPlay() {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer);
                this.autoPlayTimer = null;
            }
        }

        preloadImages() {
            this.options.images.forEach(img => {
                const image = new Image();
                image.src = img.url || img;
            });
        }

        destroy() {
            this.stopAutoPlay();
            this.container.innerHTML = '';
        }

        // Public API
        getCurrentIndex() {
            return this.currentIndex;
        }

        getTotalSlides() {
            return this.options.images.length;
        }

        updateImages(newImages) {
            this.options.images = newImages;
            this.currentIndex = 0;
            this.render();
            this.attachEvents();
        }
    }

    // Export to global
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HeroSlider;
    } else {
        global.HeroSlider = HeroSlider;
    }

})(typeof window !== 'undefined' ? window : this);