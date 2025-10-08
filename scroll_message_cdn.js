/**
 * ScrollMessage.js v1.0.0
 * Modern scrolling message banner with multiple effects
 * Usage: new ScrollMessage('#message-container', options)
 */

(function(global) {
    'use strict';

    class ScrollMessage {
        constructor(selector, options = {}) {
            this.container = typeof selector === 'string' 
                ? document.querySelector(selector) 
                : selector;
            
            if (!this.container) {
                console.error('ScrollMessage: Container not found');
                return;
            }

            // Default options
            this.options = {
                messages: options.messages || ['Welcome to our website!'],
                effect: options.effect || 'scroll', // scroll, fade, typing, slide, wave, bounce
                direction: options.direction || 'left', // left, right, up, down
                speed: options.speed || 50, // pixels per second (for scroll) or ms per char (for typing)
                pauseDuration: options.pauseDuration || 2000, // pause between messages
                backgroundColor: options.backgroundColor || '#007bff',
                textColor: options.textColor || '#ffffff',
                fontSize: options.fontSize || '16px',
                fontWeight: options.fontWeight || '500',
                height: options.height || 'auto',
                padding: options.padding || '15px 20px',
                icon: options.icon || null, // emoji or html
                iconPosition: options.iconPosition || 'left', // left, right, both
                gradient: options.gradient || null, // e.g., 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                borderRadius: options.borderRadius || '0',
                shadow: options.shadow || false,
                clickable: options.clickable || false,
                link: options.link || null,
                pauseOnHover: options.pauseOnHover !== false,
                showClose: options.showClose || false,
                animation: options.animation || 'smooth', // smooth, linear, ease-in-out
                loop: options.loop !== false,
                multiline: options.multiline || false,
                separatorIcon: options.separatorIcon || ' • ',
                glowEffect: options.glowEffect || false,
                pulseEffect: options.pulseEffect || false,
                onMessageChange: options.onMessageChange || null,
                onClick: options.onClick || null,
                onClose: options.onClose || null
            };

            this.currentMessageIndex = 0;
            this.isPaused = false;
            this.animationFrame = null;
            this.typingTimeout = null;

            this.init();
        }

        init() {
            if (this.options.messages.length === 0) {
                console.warn('ScrollMessage: No messages provided');
                return;
            }

            this.render();
            this.startAnimation();
        }

        render() {
            const background = this.options.gradient || this.options.backgroundColor;
            const cursor = this.options.clickable || this.options.link ? 'pointer' : 'default';
            const shadow = this.options.shadow ? 'box-shadow: 0 2px 8px rgba(0,0,0,0.15);' : '';
            const glow = this.options.glowEffect ? `
                animation: glow 2s ease-in-out infinite;
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px ${this.options.backgroundColor}, 0 0 10px ${this.options.backgroundColor}; }
                    50% { box-shadow: 0 0 20px ${this.options.backgroundColor}, 0 0 30px ${this.options.backgroundColor}; }
                }
            ` : '';

            this.container.innerHTML = `
                <div class="scroll-message-wrapper" style="
                    position: relative;
                    background: ${background};
                    color: ${this.options.textColor};
                    font-size: ${this.options.fontSize};
                    font-weight: ${this.options.fontWeight};
                    padding: ${this.options.padding};
                    overflow: hidden;
                    cursor: ${cursor};
                    border-radius: ${this.options.borderRadius};
                    height: ${this.options.height};
                    ${shadow}
                    ${this.options.pulseEffect ? 'animation: pulse 2s ease-in-out infinite;' : ''}
                ">
                    <div class="scroll-message-content" style="
                        display: flex;
                        align-items: center;
                        justify-content: ${this.options.effect === 'typing' ? 'flex-start' : 'center'};
                        gap: 10px;
                        white-space: ${this.options.multiline ? 'normal' : 'nowrap'};
                        ${this.options.effect === 'scroll' ? 'position: absolute;' : ''}
                    ">
                        ${this.renderIcon('left')}
                        <span class="message-text"></span>
                        ${this.renderIcon('right')}
                    </div>
                    ${this.options.showClose ? this.renderCloseButton() : ''}
                </div>
                ${this.options.pulseEffect ? `
                    <style>
                        @keyframes pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.02); }
                        }
                    </style>
                ` : ''}
                ${this.options.glowEffect ? `
                    <style>
                        @keyframes glow {
                            0%, 100% { box-shadow: 0 0 5px ${this.options.backgroundColor}, 0 0 10px ${this.options.backgroundColor}; }
                            50% { box-shadow: 0 0 20px ${this.options.backgroundColor}, 0 0 30px ${this.options.backgroundColor}; }
                        }
                        .scroll-message-wrapper { animation: glow 2s ease-in-out infinite; }
                    </style>
                ` : ''}
            `;

            this.wrapper = this.container.querySelector('.scroll-message-wrapper');
            this.content = this.container.querySelector('.scroll-message-content');
            this.messageText = this.container.querySelector('.message-text');

            this.attachEvents();
        }

        renderIcon(position) {
            if (!this.options.icon) return '';
            if (this.options.iconPosition !== position && this.options.iconPosition !== 'both') return '';

            return `<span class="message-icon" style="font-size: 1.2em;">${this.options.icon}</span>`;
        }

        renderCloseButton() {
            return `
                <button class="scroll-message-close" style="
                    position: absolute;
                    top: 50%;
                    right: 10px;
                    transform: translateY(-50%);
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: ${this.options.textColor};
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s;
                    font-size: 18px;
                    line-height: 1;
                ">×</button>
            `;
        }

        attachEvents() {
            // Pause on hover
            if (this.options.pauseOnHover) {
                this.wrapper.addEventListener('mouseenter', () => {
                    this.isPaused = true;
                    if (this.animationFrame) {
                        cancelAnimationFrame(this.animationFrame);
                    }
                    if (this.typingTimeout) {
                        clearTimeout(this.typingTimeout);
                    }
                });

                this.wrapper.addEventListener('mouseleave', () => {
                    this.isPaused = false;
                    this.startAnimation();
                });
            }

            // Click handler
            if (this.options.clickable || this.options.link || this.options.onClick) {
                this.wrapper.addEventListener('click', (e) => {
                    if (e.target.classList.contains('scroll-message-close')) return;
                    
                    if (this.options.onClick) {
                        this.options.onClick(this.currentMessageIndex, this);
                    }
                    
                    if (this.options.link) {
                        window.open(this.options.link, '_blank');
                    }
                });
            }

            // Close button
            const closeBtn = this.container.querySelector('.scroll-message-close');
            if (closeBtn) {
                closeBtn.addEventListener('mouseenter', (e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                });
                closeBtn.addEventListener('mouseleave', (e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                });
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.close();
                });
            }
        }

        startAnimation() {
            if (this.isPaused) return;

            switch (this.options.effect) {
                case 'scroll':
                    this.animateScroll();
                    break;
                case 'fade':
                    this.animateFade();
                    break;
                case 'typing':
                    this.animateTyping();
                    break;
                case 'slide':
                    this.animateSlide();
                    break;
                case 'wave':
                    this.animateWave();
                    break;
                case 'bounce':
                    this.animateBounce();
                    break;
                default:
                    this.animateScroll();
            }
        }

        animateScroll() {
            const message = this.getCurrentMessage();
            this.messageText.textContent = message;
            
            const wrapperWidth = this.wrapper.offsetWidth;
            const contentWidth = this.content.offsetWidth;
            let position = this.options.direction === 'left' ? wrapperWidth : -contentWidth;
            const targetPosition = this.options.direction === 'left' ? -contentWidth : wrapperWidth;
            
            const animate = () => {
                if (this.isPaused) return;

                const direction = this.options.direction === 'left' ? -1 : 1;
                position += direction * (this.options.speed / 60);
                
                this.content.style.left = position + 'px';
                
                const hasCompleted = this.options.direction === 'left' 
                    ? position <= targetPosition 
                    : position >= targetPosition;

                if (hasCompleted) {
                    if (this.options.loop) {
                        this.nextMessage();
                        this.animateScroll();
                    }
                } else {
                    this.animationFrame = requestAnimationFrame(animate);
                }
            };

            animate();
        }

        animateFade() {
            this.content.style.position = 'relative';
            this.content.style.transition = 'opacity 0.5s ease';
            
            const showMessage = () => {
                if (this.isPaused) {
                    setTimeout(showMessage, 100);
                    return;
                }

                this.content.style.opacity = '0';
                
                setTimeout(() => {
                    this.messageText.textContent = this.getCurrentMessage();
                    this.content.style.opacity = '1';
                    
                    setTimeout(() => {
                        if (this.options.loop) {
                            this.nextMessage();
                            showMessage();
                        }
                    }, this.options.pauseDuration);
                }, 500);
            };

            this.messageText.textContent = this.getCurrentMessage();
            this.content.style.opacity = '1';
            
            setTimeout(() => {
                if (this.options.loop) {
                    this.nextMessage();
                    showMessage();
                }
            }, this.options.pauseDuration);
        }

        animateTyping() {
            const message = this.getCurrentMessage();
            let charIndex = 0;
            this.messageText.textContent = '';
            
            const type = () => {
                if (this.isPaused) {
                    this.typingTimeout = setTimeout(type, 100);
                    return;
                }

                if (charIndex < message.length) {
                    this.messageText.textContent += message[charIndex];
                    charIndex++;
                    this.typingTimeout = setTimeout(type, this.options.speed);
                } else {
                    this.typingTimeout = setTimeout(() => {
                        if (this.options.loop) {
                            this.nextMessage();
                            this.animateTyping();
                        }
                    }, this.options.pauseDuration);
                }
            };

            type();
        }

        animateSlide() {
            this.content.style.transition = `transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
            this.content.style.position = 'relative';
            
            const showMessage = () => {
                if (this.isPaused) {
                    setTimeout(showMessage, 100);
                    return;
                }

                const direction = this.options.direction === 'up' ? 'Y' : 'X';
                const distance = this.options.direction === 'up' || this.options.direction === 'left' ? '-100%' : '100%';
                
                this.content.style.transform = `translate${direction}(${distance})`;
                this.content.style.opacity = '0';
                
                setTimeout(() => {
                    this.messageText.textContent = this.getCurrentMessage();
                    this.content.style.transition = 'none';
                    this.content.style.transform = `translate${direction}(${distance === '-100%' ? '100%' : '-100%'})`;
                    
                    setTimeout(() => {
                        this.content.style.transition = `transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s`;
                        this.content.style.transform = 'translate(0, 0)';
                        this.content.style.opacity = '1';
                        
                        setTimeout(() => {
                            if (this.options.loop) {
                                this.nextMessage();
                                showMessage();
                            }
                        }, this.options.pauseDuration);
                    }, 50);
                }, 500);
            };

            this.messageText.textContent = this.getCurrentMessage();
            this.content.style.opacity = '1';
            
            setTimeout(() => {
                if (this.options.loop) {
                    this.nextMessage();
                    showMessage();
                }
            }, this.options.pauseDuration);
        }

        animateWave() {
            this.messageText.textContent = '';
            const message = this.getCurrentMessage();
            
            message.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.animation = `wave 1s ease-in-out infinite`;
                span.style.animationDelay = `${index * 0.05}s`;
                this.messageText.appendChild(span);
            });

            // Add wave animation if not exists
            if (!document.getElementById('wave-animation-style')) {
                const style = document.createElement('style');
                style.id = 'wave-animation-style';
                style.textContent = `
                    @keyframes wave {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `;
                document.head.appendChild(style);
            }

            if (this.options.loop && this.options.messages.length > 1) {
                setTimeout(() => {
                    this.nextMessage();
                    this.animateWave();
                }, this.options.pauseDuration + (message.length * 50));
            }
        }

        animateBounce() {
            this.content.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            
            const showMessage = () => {
                if (this.isPaused) {
                    setTimeout(showMessage, 100);
                    return;
                }

                this.content.style.transform = 'scale(0)';
                
                setTimeout(() => {
                    this.messageText.textContent = this.getCurrentMessage();
                    this.content.style.transform = 'scale(1.2)';
                    
                    setTimeout(() => {
                        this.content.style.transform = 'scale(1)';
                        
                        setTimeout(() => {
                            if (this.options.loop) {
                                this.nextMessage();
                                showMessage();
                            }
                        }, this.options.pauseDuration);
                    }, 200);
                }, 300);
            };

            this.messageText.textContent = this.getCurrentMessage();
            this.content.style.transform = 'scale(1)';
            
            setTimeout(() => {
                if (this.options.loop) {
                    this.nextMessage();
                    showMessage();
                }
            }, this.options.pauseDuration);
        }

        getCurrentMessage() {
            if (this.options.messages.length === 1) {
                return this.options.messages[0];
            }
            
            if (this.options.effect === 'scroll') {
                // For continuous scroll, join all messages
                return this.options.messages.join(this.options.separatorIcon);
            }
            
            return this.options.messages[this.currentMessageIndex];
        }

        nextMessage() {
            this.currentMessageIndex = (this.currentMessageIndex + 1) % this.options.messages.length;
            
            if (this.options.onMessageChange) {
                this.options.onMessageChange(this.currentMessageIndex, this);
            }
        }

        // Public API Methods
        updateMessages(newMessages) {
            this.options.messages = newMessages;
            this.currentMessageIndex = 0;
            
            // Restart animation
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            if (this.typingTimeout) {
                clearTimeout(this.typingTimeout);
            }
            
            this.startAnimation();
        }

        addMessage(message) {
            this.options.messages.push(message);
        }

        pause() {
            this.isPaused = true;
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            if (this.typingTimeout) {
                clearTimeout(this.typingTimeout);
            }
        }

        resume() {
            this.isPaused = false;
            this.startAnimation();
        }

        close() {
            this.pause();
            this.wrapper.style.transition = 'all 0.3s ease';
            this.wrapper.style.opacity = '0';
            this.wrapper.style.transform = 'translateY(-100%)';
            
            setTimeout(() => {
                this.container.innerHTML = '';
                if (this.options.onClose) {
                    this.options.onClose(this);
                }
            }, 300);
        }

        show() {
            this.wrapper.style.display = 'block';
            this.wrapper.style.opacity = '1';
            this.wrapper.style.transform = 'translateY(0)';
            this.resume();
        }

        hide() {
            this.wrapper.style.display = 'none';
            this.pause();
        }

        destroy() {
            this.pause();
            this.container.innerHTML = '';
        }

        setSpeed(speed) {
            this.options.speed = speed;
            this.pause();
            this.resume();
        }

        setEffect(effect) {
            this.options.effect = effect;
            this.pause();
            this.startAnimation();
        }

        getCurrentIndex() {
            return this.currentMessageIndex;
        }

        getTotalMessages() {
            return this.options.messages.length;
        }

        jumpToMessage(index) {
            if (index >= 0 && index < this.options.messages.length) {
                this.currentMessageIndex = index;
                this.pause();
                this.startAnimation();
            }
        }
    }

    // Export to global
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ScrollMessage;
    } else {
        global.ScrollMessage = ScrollMessage;
    }

})(typeof window !== 'undefined' ? window : this);