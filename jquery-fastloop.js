/**
 * jQuery FastLoop Plugin
 * A high-performance template rendering plugin for jQuery
 * Features: batch processing, DOM recycling, and event handling
 */
(function ($) {
    $.fn.loopHtml = function (options) {
        // Default settings merged with user options
        const settings = $.extend(
            {
                data: [],            // Array of data to be rendered
                template: '',        // HTML template (string or element)
                renderCallback: null, // Custom template processing function
                validateData: true,   // Enable input validation
                batchSize: 1000,     // Items to process per batch
                reuseNodes: true     // Enable DOM node recycling
            },
            options
        );

        // Process each matched element
        return this.each(function () {
            const $container = $(this);
            let templateHtml;
            let compiledTemplate;    // Cached compiled template
            let existingNodes = [];  // Cache for DOM recycling

            // Input data validation
            if (settings.validateData && (!Array.isArray(settings.data))) {
                console.error('Data must be an array!');
                return;
            }

            // Extract template HTML from input source
            if (settings.template instanceof HTMLElement) {
                templateHtml = $(settings.template).html();
            } else if (typeof settings.template === 'string') {
                templateHtml = settings.template;
            } else {
                console.error('Invalid template format!');
                return;
            }

            /**
             * Main render function
             * Implements batch processing and DOM recycling
             * @param {Array} data - Array of items to render
             */
            const render = (data) => {
                if (!templateHtml) return;

                const fragment = document.createDocumentFragment();
                const batchSize = settings.batchSize;
                
                try {
                    // Setup DOM recycling if enabled
                    if (settings.reuseNodes) {
                        existingNodes = Array.from($container.children());
                    }

                    /**
                     * Process a batch of items
                     * Uses requestAnimationFrame for smooth rendering
                     * @param {number} startIndex - Starting index for current batch
                     */
                    const processBatch = (startIndex) => {
                        const endIndex = Math.min(startIndex + batchSize, data.length);
                        
                        for (let i = startIndex; i < endIndex; i++) {
                            const item = data[i];
                            let html;
                            
                            // Generate HTML using callback or template
                            if (typeof settings.renderCallback === 'function') {
                                html = settings.renderCallback(templateHtml, item, i);
                            } else {
                                // Use cached template for better performance
                                if (!compiledTemplate) {
                                    compiledTemplate = templateHtml;
                                }
                                
                                // Single-pass template variable replacement
                                html = compiledTemplate.replace(/{{(\w+)}}/g, (match, key) => {
                                    if (key === 'index') return i + 1;
                                    return item[key] || '';
                                });
                            }

                            let element;
                            if (settings.reuseNodes && existingNodes[i]) {
                                // Reuse existing DOM node
                                element = existingNodes[i];
                                element.innerHTML = html.trim();
                            } else {
                                // Create new DOM node
                                const tempElement = document.createElement('div');
                                tempElement.innerHTML = html.trim();
                                element = tempElement.firstElementChild;
                            }
                            
                            fragment.appendChild(element);
                        }

                        // Process next batch or finish rendering
                        if (endIndex < data.length) {
                            requestAnimationFrame(() => processBatch(endIndex));
                        } else {
                            // Clean up unused nodes
                            if (settings.reuseNodes) {
                                existingNodes.slice(data.length).forEach(node => node.remove());
                            }
                            $container.empty().append(fragment);
                        }
                    };

                    // Start processing first batch
                    processBatch(0);

                } catch (error) {
                    console.error('Render error:', error);
                }
            };

            // Perform initial render
            render(settings.data);

            // Setup data update listener if configured
            if (settings.keyMap && settings.keyMap.updateData) {
                $(document).on(settings.keyMap.updateData, (event, newData) => {
                    settings.data = newData;
                    render(settings.data);
                });
            }

            /**
             * Store instance methods on the element
             * Allows for cleanup and external control
             */
            $container.data('loopHtml', {
                destroy: function() {
                    // Remove event listeners and clean up
                    if (settings.keyMap && settings.keyMap.updateData) {
                        $(document).off(settings.keyMap.updateData);
                    }
                    $container.empty();
                    $container.removeData('loopHtml');
                }
            });
        });
    };
})(jQuery);