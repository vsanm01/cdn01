/**
 * SmartSearch.js - Universal Product Search Library
 * Version: 1.0.0
 * Author: Your Name
 * License: MIT
 * 
 * A lightweight, customizable search library with autocomplete suggestions
 * Can be used in any e-commerce or product catalog website
 */

(function(global) {
    'use strict';

    /**
     * SmartSearch Constructor
     * @param {Object} options - Configuration options
     */
    function SmartSearch(options) {
        // Default configuration
        this.config = {
            // Required
            searchInputId: options.searchInputId || 'search-input',
            searchButtonId: options.searchButtonId || 'search-button',
            suggestionsId: options.suggestionsId || 'search-suggestions',
            
            // Data source
            data: options.data || [],
            dataSource: options.dataSource || null, // Function or URL to fetch data
            
            // Search configuration
            searchKeys: options.searchKeys || ['name'], // Keys to search in data objects
            minChars: options.minChars || 2,
            maxSuggestions: options.maxSuggestions || 5,
            caseSensitive: options.caseSensitive || false,
            fuzzySearch: options.fuzzySearch || false,
            highlightMatches: options.highlightMatches || true,
            
            // Callbacks
            onSearch: options.onSearch || null,
            onSelect: options.onSelect || null,
            onSuggestionClick: options.onSuggestionClick || null,
            
            // Styling
            suggestionTemplate: options.suggestionTemplate || null,
            noResultsText: options.noResultsText || 'No results found',
            loadingText: options.loadingText || 'Loading...',
            
            // Features
            searchHistory: options.searchHistory || false,
            historyLimit: options.historyLimit || 5,
            debounceDelay: options.debounceDelay || 300,
            enableKeyboardNavigation: options.enableKeyboardNavigation !== false,
            
            // Display options
            showIcon: options.showIcon !== false,
            iconField: options.iconField || 'icon',
            showCategory: options.showCategory !== false,
            categoryField: options.categoryField || 'category',
            showPrice: options.showPrice !== false,
            priceField: options.priceField || 'price',
            currencySymbol: options.currencySymbol || '₹',
            
            // Auto-scroll options
            scrollToResult: options.scrollToResult || false,
            scrollOffset: options.scrollOffset || 100,
            highlightDuration: options.highlightDuration || 2000,
            highlightColor: options.highlightColor || '#007bff'
        };

        // Internal state
        this.searchInput = null;
        this.searchButton = null;
        this.suggestionsContainer = null;
        this.currentFocus = -1;
        this.searchHistory = [];
        this.debounceTimer = null;
        this.isLoading = false;

        // Initialize
        this.init();
    }

    /**
     * Initialize the search functionality
     */
    SmartSearch.prototype.init = function() {
        // Get DOM elements
        this.searchInput = document.getElementById(this.config.searchInputId);
        this.searchButton = document.getElementById(this.config.searchButtonId);
        this.suggestionsContainer = document.getElementById(this.config.suggestionsId);

        if (!this.searchInput) {
            console.error('SmartSearch: Search input element not found');
            return;
        }

        // Load search history from localStorage
        if (this.config.searchHistory) {
            this.loadSearchHistory();
        }

        // Attach event listeners
        this.attachEventListeners();

        // Fetch data if dataSource is provided
        if (this.config.dataSource && this.config.data.length === 0) {
            this.fetchData();
        }

        // Create suggestions container if it doesn't exist
        if (!this.suggestionsContainer) {
            this.createSuggestionsContainer();
        }
    };

    /**
     * Create suggestions container dynamically
     */
    SmartSearch.prototype.createSuggestionsContainer = function() {
        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.id = this.config.suggestionsId;
        this.suggestionsContainer.className = 'smart-search-suggestions';
        this.suggestionsContainer.style.display = 'none';
        
        // Insert after search input
        this.searchInput.parentNode.insertBefore(
            this.suggestionsContainer, 
            this.searchInput.nextSibling
        );
    };

    /**
     * Attach event listeners
     */
    SmartSearch.prototype.attachEventListeners = function() {
        var self = this;

        // Input event with debounce
        this.searchInput.addEventListener('input', function(e) {
            clearTimeout(self.debounceTimer);
            self.debounceTimer = setTimeout(function() {
                self.handleInput(e);
            }, self.config.debounceDelay);
        });

        // Search button click
        if (this.searchButton) {
            this.searchButton.addEventListener('click', function() {
                self.performSearch(self.searchInput.value);
            });
        }

        // Enter key to search
        this.searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (self.currentFocus > -1) {
                    // Select highlighted suggestion
                    var suggestions = self.suggestionsContainer.getElementsByClassName('smart-search-suggestion-item');
                    if (suggestions[self.currentFocus]) {
                        suggestions[self.currentFocus].click();
                    }
                } else {
                    self.performSearch(self.searchInput.value);
                }
            } else if (self.config.enableKeyboardNavigation) {
                self.handleKeyboardNavigation(e);
            }
        });

        // Click outside to close suggestions
        document.addEventListener('click', function(e) {
            if (!self.searchInput.contains(e.target) && 
                !self.suggestionsContainer.contains(e.target)) {
                self.hideSuggestions();
            }
        });

        // Focus to show history (if enabled)
        if (this.config.searchHistory) {
            this.searchInput.addEventListener('focus', function() {
                if (self.searchInput.value.trim() === '' && self.searchHistory.length > 0) {
                    self.showSearchHistory();
                }
            });
        }
    };

    /**
     * Handle input changes
     */
    SmartSearch.prototype.handleInput = function(e) {
        var query = e.target.value.trim();

        if (query.length < this.config.minChars) {
            this.hideSuggestions();
            return;
        }

        var results = this.search(query);
        this.displaySuggestions(results, query);
    };

    /**
     * Search function
     */
    SmartSearch.prototype.search = function(query) {
        var self = this;
        var results = [];

        if (!this.config.caseSensitive) {
            query = query.toLowerCase();
        }

        this.config.data.forEach(function(item) {
            var match = false;
            var matchScore = 0;

            self.config.searchKeys.forEach(function(key) {
                var value = self.getNestedValue(item, key);
                if (!value) return;

                if (!self.config.caseSensitive) {
                    value = value.toString().toLowerCase();
                }

                if (self.config.fuzzySearch) {
                    var score = self.fuzzyMatch(query, value);
                    if (score > 0) {
                        match = true;
                        matchScore = Math.max(matchScore, score);
                    }
                } else {
                    if (value.indexOf(query) !== -1) {
                        match = true;
                        // Prioritize matches at the beginning
                        matchScore = value.indexOf(query) === 0 ? 100 : 50;
                    }
                }
            });

            if (match) {
                results.push({
                    item: item,
                    score: matchScore
                });
            }
        });

        // Sort by score (higher is better)
        results.sort(function(a, b) {
            return b.score - a.score;
        });

        // Return only items, limited to maxSuggestions
        return results.slice(0, this.config.maxSuggestions).map(function(r) {
            return r.item;
        });
    };

    /**
     * Fuzzy matching algorithm
     */
    SmartSearch.prototype.fuzzyMatch = function(pattern, str) {
        var patternIdx = 0;
        var score = 0;
        var consecutiveMatches = 0;

        for (var i = 0; i < str.length; i++) {
            if (pattern[patternIdx] === str[i]) {
                patternIdx++;
                consecutiveMatches++;
                score += 10 + consecutiveMatches;
                
                if (patternIdx === pattern.length) {
                    return score;
                }
            } else {
                consecutiveMatches = 0;
            }
        }

        return patternIdx === pattern.length ? score : 0;
    };

    /**
     * Display suggestions
     */
    SmartSearch.prototype.displaySuggestions = function(results, query) {
        var self = this;

        if (results.length === 0) {
            this.suggestionsContainer.innerHTML = 
                '<div class="smart-search-no-results">' + this.config.noResultsText + '</div>';
            this.suggestionsContainer.style.display = 'block';
            return;
        }

        this.suggestionsContainer.innerHTML = '';
        this.currentFocus = -1;

        results.forEach(function(item, index) {
            var suggestionItem = self.createSuggestionItem(item, query, index);
            self.suggestionsContainer.appendChild(suggestionItem);
        });

        this.suggestionsContainer.style.display = 'block';
    };

    /**
     * Create suggestion item
     */
    SmartSearch.prototype.createSuggestionItem = function(item, query, index) {
        var self = this;
        var suggestionItem = document.createElement('div');
        suggestionItem.className = 'smart-search-suggestion-item';

        // Use custom template if provided
        if (this.config.suggestionTemplate) {
            suggestionItem.innerHTML = this.config.suggestionTemplate(item, query);
        } else {
            // Default template
            var html = '<div class="smart-search-item-content">';

            // Icon
            if (this.config.showIcon) {
                var icon = this.getNestedValue(item, this.config.iconField) || '🔍';
                html += '<span class="smart-search-icon">' + icon + '</span>';
            }

            // Main content
            html += '<div class="smart-search-details">';
            
            // Name (highlight matches)
            var name = this.getNestedValue(item, this.config.searchKeys[0]) || '';
            if (this.config.highlightMatches && query) {
                name = this.highlightText(name, query);
            }
            html += '<div class="smart-search-name">' + name + '</div>';

            // Price
            if (this.config.showPrice && this.getNestedValue(item, this.config.priceField)) {
                var price = this.getNestedValue(item, this.config.priceField);
                html += '<div class="smart-search-price">' + 
                        this.config.currencySymbol + price + '</div>';
            }

            html += '</div>';

            // Category
            if (this.config.showCategory && this.getNestedValue(item, this.config.categoryField)) {
                var category = this.getNestedValue(item, this.config.categoryField);
                html += '<span class="smart-search-category">' + category + '</span>';
            }

            html += '</div>';
            suggestionItem.innerHTML = html;
        }

        // Click event
        suggestionItem.addEventListener('click', function() {
            self.selectSuggestion(item, index);
        });

        // Hover event
        suggestionItem.addEventListener('mouseenter', function() {
            self.setActiveSuggestion(index);
        });

        return suggestionItem;
    };

    /**
     * Highlight matching text
     */
    SmartSearch.prototype.highlightText = function(text, query) {
        if (!this.config.caseSensitive) {
            var regex = new RegExp('(' + this.escapeRegex(query) + ')', 'gi');
            return text.replace(regex, '<strong>$1</strong>');
        } else {
            var regex = new RegExp('(' + this.escapeRegex(query) + ')', 'g');
            return text.replace(regex, '<strong>$1</strong>');
        }
    };

    /**
     * Escape regex special characters
     */
    SmartSearch.prototype.escapeRegex = function(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    /**
     * Select suggestion
     */
    SmartSearch.prototype.selectSuggestion = function(item, index) {
        var self = this;
        var displayValue = this.getNestedValue(item, this.config.searchKeys[0]);
        
        this.searchInput.value = displayValue;
        this.hideSuggestions();

        // Save to history
        if (this.config.searchHistory) {
            this.addToSearchHistory(displayValue);
        }

        // Callback
        if (this.config.onSuggestionClick) {
            this.config.onSuggestionClick(item, index);
        }

        // Auto-scroll to result
        if (this.config.scrollToResult) {
            this.scrollToResult(item);
        }

        // Perform search
        this.performSearch(displayValue, item);
    };

    /**
     * Scroll to result and highlight
     */
    SmartSearch.prototype.scrollToResult = function(item) {
        var self = this;
        
        // Find the element (you may need to customize this selector)
        var elements = document.querySelectorAll('[data-product-id="' + item.id + '"]');
        
        if (elements.length === 0) {
            // Alternative: search by name
            elements = Array.from(document.querySelectorAll('.product-card, .product-item'))
                .filter(function(el) {
                    return el.textContent.includes(
                        self.getNestedValue(item, self.config.searchKeys[0])
                    );
                });
        }

        if (elements.length > 0) {
            var element = elements[0];
            
            // Scroll to element
            var offsetTop = element.offsetTop - this.config.scrollOffset;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Highlight element
            var originalBorder = element.style.border;
            element.style.border = '2px solid ' + this.config.highlightColor;
            element.style.transition = 'border 0.3s ease';

            setTimeout(function() {
                element.style.border = originalBorder;
            }, this.config.highlightDuration);
        }
    };

    /**
     * Keyboard navigation
     */
    SmartSearch.prototype.handleKeyboardNavigation = function(e) {
        var suggestions = this.suggestionsContainer.getElementsByClassName('smart-search-suggestion-item');
        
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.currentFocus++;
            if (this.currentFocus >= suggestions.length) {
                this.currentFocus = 0;
            }
            this.setActiveSuggestion(this.currentFocus);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.currentFocus--;
            if (this.currentFocus < 0) {
                this.currentFocus = suggestions.length - 1;
            }
            this.setActiveSuggestion(this.currentFocus);
        } else if (e.key === 'Escape') {
            this.hideSuggestions();
        }
    };

    /**
     * Set active suggestion
     */
    SmartSearch.prototype.setActiveSuggestion = function(index) {
        var suggestions = this.suggestionsContainer.getElementsByClassName('smart-search-suggestion-item');
        
        // Remove active class from all
        Array.from(suggestions).forEach(function(item) {
            item.classList.remove('smart-search-active');
        });

        // Add active class to current
        if (suggestions[index]) {
            suggestions[index].classList.add('smart-search-active');
            this.currentFocus = index;
        }
    };

    /**
     * Perform search
     */
    SmartSearch.prototype.performSearch = function(query, selectedItem) {
        if (this.config.onSearch) {
            var results = selectedItem ? [selectedItem] : this.search(query);
            this.config.onSearch(query, results);
        }

        this.hideSuggestions();
    };

    /**
     * Hide suggestions
     */
    SmartSearch.prototype.hideSuggestions = function() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.style.display = 'none';
            this.currentFocus = -1;
        }
    };

    /**
     * Show suggestions
     */
    SmartSearch.prototype.showSuggestions = function() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.style.display = 'block';
        }
    };

    /**
     * Search history functions
     */
    SmartSearch.prototype.loadSearchHistory = function() {
        try {
            var history = localStorage.getItem('smartsearch_history');
            this.searchHistory = history ? JSON.parse(history) : [];
        } catch (e) {
            this.searchHistory = [];
        }
    };

    SmartSearch.prototype.addToSearchHistory = function(query) {
        // Remove if already exists
        var index = this.searchHistory.indexOf(query);
        if (index > -1) {
            this.searchHistory.splice(index, 1);
        }

        // Add to beginning
        this.searchHistory.unshift(query);

        // Limit history
        if (this.searchHistory.length > this.config.historyLimit) {
            this.searchHistory = this.searchHistory.slice(0, this.config.historyLimit);
        }

        // Save to localStorage
        try {
            localStorage.setItem('smartsearch_history', JSON.stringify(this.searchHistory));
        } catch (e) {
            console.warn('SmartSearch: Could not save search history');
        }
    };

    SmartSearch.prototype.showSearchHistory = function() {
        var self = this;
        this.suggestionsContainer.innerHTML = '';

        if (this.searchHistory.length === 0) return;

        // Add history header
        var header = document.createElement('div');
        header.className = 'smart-search-history-header';
        header.textContent = 'Recent Searches';
        this.suggestionsContainer.appendChild(header);

        // Add history items
        this.searchHistory.forEach(function(query, index) {
            var historyItem = document.createElement('div');
            historyItem.className = 'smart-search-suggestion-item smart-search-history-item';
            historyItem.innerHTML = 
                '<span class="smart-search-icon">🕐</span>' +
                '<div class="smart-search-details">' +
                    '<div class="smart-search-name">' + query + '</div>' +
                '</div>';

            historyItem.addEventListener('click', function() {
                self.searchInput.value = query;
                self.performSearch(query);
            });

            self.suggestionsContainer.appendChild(historyItem);
        });

        this.suggestionsContainer.style.display = 'block';
    };

    SmartSearch.prototype.clearSearchHistory = function() {
        this.searchHistory = [];
        try {
            localStorage.removeItem('smartsearch_history');
        } catch (e) {
            console.warn('SmartSearch: Could not clear search history');
        }
    };

    /**
     * Fetch data from source
     */
    SmartSearch.prototype.fetchData = function() {
        var self = this;
        this.isLoading = true;

        if (typeof this.config.dataSource === 'function') {
            // Data source is a function
            var result = this.config.dataSource();
            
            if (result && typeof result.then === 'function') {
                // It's a promise
                result.then(function(data) {
                    self.config.data = data;
                    self.isLoading = false;
                }).catch(function(error) {
                    console.error('SmartSearch: Error fetching data', error);
                    self.isLoading = false;
                });
            } else {
                // Synchronous function
                self.config.data = result;
                self.isLoading = false;
            }
        } else if (typeof this.config.dataSource === 'string') {
            // Data source is a URL
            fetch(this.config.dataSource)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    self.config.data = data;
                    self.isLoading = false;
                })
                .catch(function(error) {
                    console.error('SmartSearch: Error fetching data from URL', error);
                    self.isLoading = false;
                });
        }
    };

    /**
     * Update data
     */
    SmartSearch.prototype.updateData = function(newData) {
        this.config.data = newData;
    };

    /**
     * Get nested object value
     */
    SmartSearch.prototype.getNestedValue = function(obj, path) {
        if (!path) return obj;
        
        var keys = path.split('.');
        var value = obj;
        
        for (var i = 0; i < keys.length; i++) {
            if (value && typeof value === 'object' && keys[i] in value) {
                value = value[keys[i]];
            } else {
                return null;
            }
        }
        
        return value;
    };

    /**
     * Destroy instance
     */
    SmartSearch.prototype.destroy = function() {
        // Remove event listeners
        this.searchInput.removeEventListener('input', this.handleInput);
        if (this.searchButton) {
            this.searchButton.removeEventListener('click', this.performSearch);
        }

        // Remove suggestions container if dynamically created
        if (this.suggestionsContainer && this.suggestionsContainer.parentNode) {
            this.suggestionsContainer.parentNode.removeChild(this.suggestionsContainer);
        }
    };

    // Expose to global scope
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SmartSearch;
    } else {
        global.SmartSearch = SmartSearch;
    }

})(typeof window !== 'undefined' ? window : this);
