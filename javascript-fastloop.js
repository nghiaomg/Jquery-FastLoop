/**
 * FastLoop - A high-performance JavaScript template rendering engine
 * Efficiently renders large datasets with DOM reuse and batch processing
 */
class FastLoop {
    /**
     * Creates a new FastLoop instance
     * @param {Object} options - Configuration options
     */
    constructor(options) {
        // Default settings
        this.settings = {
            container: null,      // DOM element to render content into
            data: [],            // Array of data to be rendered
            template: '',        // HTML template string or element
            renderCallback: null, // Custom render function for advanced templating
            validateData: true,   // Enable input data validation
            batchSize: 1000,     // Number of items to process in each batch
            reuseNodes: true     // Enable DOM node recycling for better performance
        };

        // Merge user options with defaults
        Object.assign(this.settings, options);

        // Initialize container element
        if (typeof this.settings.container === 'string') {
            this.container = document.querySelector(this.settings.container);
        } else if (this.settings.container instanceof HTMLElement) {
            this.container = this.settings.container;
        } else {
            throw new Error('Invalid container. Must be a CSS selector or HTMLElement');
        }

        // Internal state
        this.templateHtml = '';          // Stores the raw template HTML
        this.compiledTemplate = null;    // Cached compiled template
        this.existingNodes = [];         // Cache for DOM node recycling
        this.eventListeners = new Map(); // Event listener registry

        this.init();
    }

    /**
     * Initialize the FastLoop instance
     * Validates inputs and performs initial render
     */
    init() {
        // Validate input data structure
        if (this.settings.validateData && !Array.isArray(this.settings.data)) {
            throw new Error('Data must be an array!');
        }

        // Extract template HTML from input
        if (this.settings.template instanceof HTMLElement) {
            this.templateHtml = this.settings.template.innerHTML;
        } else if (typeof this.settings.template === 'string') {
            this.templateHtml = this.settings.template;
        } else {
            throw new Error('Invalid template format!');
        }

        // Perform initial render
        this.render(this.settings.data);
    }

    /**
     * Renders the data using the template
     * Uses batch processing and DOM recycling for performance
     * @param {Array} data - Array of items to render
     */
    render(data) {
        if (!this.templateHtml) return;

        const fragment = document.createDocumentFragment();
        const batchSize = this.settings.batchSize;
        
        try {
            // Setup DOM recycling if enabled
            if (this.settings.reuseNodes) {
                this.existingNodes = Array.from(this.container.children);
            }

            /**
             * Process a batch of items
             * Uses requestAnimationFrame for smooth rendering
             * @param {number} startIndex - Start index of current batch
             */
            const processBatch = (startIndex) => {
                const endIndex = Math.min(startIndex + batchSize, data.length);
                
                for (let i = startIndex; i < endIndex; i++) {
                    const item = data[i];
                    let html;
                    
                    // Generate HTML using custom callback or default template
                    if (typeof this.settings.renderCallback === 'function') {
                        html = this.settings.renderCallback(this.templateHtml, item, i);
                    } else {
                        // Use cached template for better performance
                        if (!this.compiledTemplate) {
                            this.compiledTemplate = this.templateHtml;
                        }
                        
                        // Replace all template variables in a single pass
                        html = this.compiledTemplate.replace(/{{(\w+)}}/g, (match, key) => {
                            if (key === 'index') return i + 1;
                            return item[key] ?? '';
                        });
                    }

                    let element;
                    if (this.settings.reuseNodes && this.existingNodes[i]) {
                        // Reuse existing DOM node
                        element = this.existingNodes[i];
                        element.innerHTML = html.trim();
                    } else {
                        // Create new DOM node
                        const temp = document.createElement('div');
                        temp.innerHTML = html.trim();
                        element = temp.firstElementChild;
                    }
                    
                    fragment.appendChild(element);
                }

                // Schedule next batch or finish rendering
                if (endIndex < data.length) {
                    requestAnimationFrame(() => processBatch(endIndex));
                } else {
                    // Clean up unused nodes
                    if (this.settings.reuseNodes) {
                        this.existingNodes.slice(data.length).forEach(node => node.remove());
                    }
                    this.container.innerHTML = '';
                    this.container.appendChild(fragment);
                }
            };

            // Start processing the first batch
            processBatch(0);

        } catch (error) {
            console.error('Render error:', error);
        }
    }

    /**
     * Updates the data and triggers a re-render
     * @param {Array} newData - New data array to render
     */
    updateData(newData) {
        this.settings.data = newData;
        this.render(this.settings.data);
    }

    /**
     * Registers an event listener
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Event handler function
     */
    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, new Set());
        }
        this.eventListeners.get(eventName).add(callback);
    }

    /**
     * Removes an event listener
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Event handler to remove
     */
    off(eventName, callback) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).delete(callback);
        }
    }

    /**
     * Triggers an event
     * @param {string} eventName - Name of the event to trigger
     * @param {*} data - Data to pass to event handlers
     */
    emit(eventName, data) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(callback => callback(data));
        }
    }

    /**
     * Cleans up resources and removes event listeners
     * Should be called when the instance is no longer needed
     */
    destroy() {
        this.eventListeners.clear();
        this.container.innerHTML = '';
        this.templateHtml = null;
        this.compiledTemplate = null;
        this.existingNodes = [];
    }
} 