/**
 * ImageHandler - Universal Image Processing Library
 * Handles various image formats including Google Drive URLs, emojis, and fallbacks
 * Version: 1.0.0
 * Author: Your Name
 * Repository: https://github.com/vsanm01/cdn01
 */

(function(global) {
    'use strict';

    const ImageHandler = {
        version: '1.0.0',
        
        /**
         * Process and validate image input
         * @param {string} imageInput - URL, emoji, text, or empty string
         * @param {object} options - Configuration options
         * @returns {object} - {type, content, fallback}
         */
        processImage(imageInput, options = {}) {
            const config = {
                defaultEmoji: options.defaultEmoji || '🛒',
                maxTextLength: options.maxTextLength || 12,
                thumbnailSize: options.thumbnailSize || 's400',
                ...options
            };

            // Handle empty or null input
            if (!imageInput || imageInput.trim() === '') {
                return {
                    type: 'empty',
                    content: 'NO IMAGE',
                    fallback: config.defaultEmoji,
                    isValid: false
                };
            }

            const trimmedInput = imageInput.trim();

            // Check if it's a valid URL
            if (this._isValidURL(trimmedInput)) {
                // Check if it's a Google Drive URL
                if (this._isGoogleDriveURL(trimmedInput)) {
                    const convertedUrl = this._convertGoogleDriveUrl(trimmedInput, config.thumbnailSize);
                    return {
                        type: 'gdrive',
                        content: convertedUrl,
                        fallback: config.defaultEmoji,
                        isValid: true,
                        original: trimmedInput
                    };
                }
                
                // Regular valid URL
                return {
                    type: 'url',
                    content: trimmedInput,
                    fallback: config.defaultEmoji,
                    isValid: true
                };
            }

            // Check if it's an emoji or special character
            if (this._isEmojiOrSymbol(trimmedInput)) {
                return {
                    type: 'emoji',
                    content: trimmedInput,
                    fallback: config.defaultEmoji,
                    isValid: true
                };
            }

            // It's text
            if (trimmedInput.length <= config.maxTextLength) {
                return {
                    type: 'text',
                    content: trimmedInput,
                    fallback: config.defaultEmoji,
                    isValid: false
                };
            }

            // Text too long - invalid URL
            return {
                type: 'invalid',
                content: 'Invalid URL',
                fallback: config.defaultEmoji,
                isValid: false
            };
        },

        /**
         * Generate HTML for image display
         * @param {string} imageInput - URL, emoji, text, or empty string
         * @param {string} altText - Alt text for accessibility
         * @param {object} options - Configuration options
         * @returns {string} - HTML string
         */
        generateHTML(imageInput, altText = 'Product Image', options = {}) {
            const result = this.processImage(imageInput, options);
            
            switch(result.type) {
                case 'url':
                case 'gdrive':
                    return `
                        <img src="${result.content}" 
                             alt="${altText}" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div style="display: none; font-size: 48px;">${result.fallback}</div>
                    `;
                
                case 'emoji':
                    return `<div style="font-size: 48px;">${result.content}</div>`;
                
                case 'empty':
                    return `
                        <div style="font-size: 24px; color: #999; font-weight: 500;">${result.content}</div>
                        <div style="font-size: 48px; margin-top: 8px;">${result.fallback}</div>
                    `;
                
                case 'text':
                    return `
                        <div style="font-size: 18px; color: #666; font-weight: 500; padding: 10px;">${result.content}</div>
                    `;
                
                case 'invalid':
                default:
                    return `
                        <div style="font-size: 16px; color: #dc3545; font-weight: 500;">${result.content}</div>
                        <div style="font-size: 48px; margin-top: 8px;">${result.fallback}</div>
                    `;
            }
        },

        /**
         * Convert Google Drive URL to thumbnail URL
         * @private
         */
        _convertGoogleDriveUrl(url, size = 's400') {
            let fileId = null;
            
            // Pattern 1: /file/d/{fileId}
            const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match1) fileId = match1[1];
            
            // Pattern 2: ?id={fileId} or &id={fileId}
            if (!fileId) {
                const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (match2) fileId = match2[1];
            }
            
            // Pattern 3: /open?id={fileId}
            if (!fileId) {
                const match3 = url.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
                if (match3) fileId = match3[1];
            }
            
            if (fileId) {
                return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
            }
            
            return url;
        },

        /**
         * Check if string is a valid URL
         * @private
         */
        _isValidURL(str) {
            try {
                const url = new URL(str);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch {
                return false;
            }
        },

        /**
         * Check if URL is a Google Drive URL
         * @private
         */
        _isGoogleDriveURL(url) {
            return url.includes('drive.google.com');
        },

        /**
         * Check if string is emoji or symbol
         * @private
         */
        _isEmojiOrSymbol(str) {
            // Check if string is 1-4 characters (emoji can be multiple chars)
            if (str.length > 4) return false;
            
            // Regex for emoji, symbols, and special characters
            const emojiRegex = /^[\p{Emoji}\p{Symbol}\p{So}\p{Sk}]+$/u;
            return emojiRegex.test(str);
        },

        /**
         * Batch process multiple images
         * @param {Array} imageArray - Array of image inputs
         * @param {object} options - Configuration options
         * @returns {Array} - Array of processed image objects
         */
        processMultiple(imageArray, options = {}) {
            return imageArray.map(img => this.processImage(img, options));
        },

        /**
         * Get library information
         */
        getInfo() {
            return {
                name: 'ImageHandler - Universal Image Processing Library',
                version: this.version,
                description: 'Handles URLs, Google Drive links, emojis, and fallbacks',
                repository: 'https://github.com/vsanm01/cdn01',
                features: [
                    'Google Drive URL conversion',
                    'Emoji detection',
                    'URL validation',
                    'Automatic fallbacks',
                    'HTML generation'
                ]
            };
        }
    };

    // Export for different environments
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = ImageHandler;
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define([], function() { return ImageHandler; });
    } else {
        // Browser global
        global.ImageHandler = ImageHandler;
    }

})(typeof window !== 'undefined' ? window : this);
