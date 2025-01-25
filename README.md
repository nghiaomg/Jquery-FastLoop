FastLoop.js
===========

A high-performance JavaScript template rendering engine for handling large datasets.
Available in both vanilla JavaScript and jQuery versions.

FEATURES
--------
* High-performance rendering with batch processing
* DOM node recycling for better memory management
* Template caching for improved performance
* Custom render callbacks
* Event system for data updates
* Input validation
* Zero dependencies (vanilla JS version)
* Auto-update data when data changes
* Supports both vanilla JavaScript and jQuery

INSTALLATION
-----------
Vanilla JavaScript:
<script src="fastloop.js"></script>

jQuery Version:
<script src="jquery.min.js"></script>
<script src="jquery-fastloop.js"></script>

BASIC USAGE
----------
1. Vanilla JavaScript:
-------------------
```javascript
const fastLoop = new FastLoop({
    container: '#myContainer',
    template: '<div class="item">{{name}}</div>',
    data: [
        { name: 'Item 1' },
        { name: 'Item 2' }
    ]
});
```

or

```html
<!-- Defines a template in HTML -->
<script type="text/template" id="item-template">
    <div class="item">
        <h3>{{name}}</h3>
        <p>{{description}}</p>
    </div>
</script>

<script>
const fastLoop = new FastLoop({
    container: '#myContainer',
    template: document.getElementById('item-template'),
    data: [
        { name: 'Item 1', description: 'Description 1' },
        { name: 'Item 2', description: 'Description 2' }
    ]
});
</script>
```

2. jQuery Version:
---------------
```javascript
$('#myContainer').loopHtml({
    template: '<div class="item">{{name}}</div>',
    data: [
        { name: 'Item 1' },
        { name: 'Item 2' }
    ]
});
```

or

```javascript
<div id="app"></div>

<template id="item-template">
    <div class="item">
        <h3>{{index}}. {{name}}</h3>
        <p>Value: {{value}}</p>
    </div>
</template>
$(document).ready(function () {
    const data = [
        { name: "Item 1", value: 10 },
        { name: "Item 2", value: 20 },
    ];

    $('#app').loopHtml({
        data: data,
        template: $('#item-template'),
        renderCallback: function (template, item, index) {
            return template
                .replace('{{index}}', `#${index + 1}`)
                .replace('{{name}}', item.name.toUpperCase())
                .replace('{{value}}', `$${item.value.toFixed(2)}`);
        },
    });
});
```

ADVANCED EXAMPLES
---------------
1. Complex Template:
------------------
```html
<template id="userTemplate">
    <div class="user-card">
        <h3>{{name}}</h3>
        <p class="title">{{title}}</p>
        <div class="details">
            <span>Age: {{age}}</span>
            <span>Email: {{email}}</span>
        </div>
        <div class="index">User #{{index}}</div>
    </div>
</template>
```

JavaScript:
```javascript
const fastLoop = new FastLoop({
    container: '#userList',
    template: document.querySelector('#userTemplate'),
    data: [
        { name: 'John Doe', title: 'Developer', age: 30, email: 'john@example.com' },
        { name: 'Jane Smith', title: 'Designer', age: 28, email: 'jane@example.com' }
    ]
});

2. Custom Render Callback:
------------------------
```javascript
const fastLoop = new FastLoop({
    container: '#list',
    template: '<div class="item">{{content}}</div>',
    data: items,
    renderCallback: (template, item, index) => {
        return template.replace('{{content}}', 
            `${item.name.toUpperCase()} - ${item.value * 2}`);
    }
});
```

3. Large Dataset Handling:
------------------------
```javascript
const fastLoop = new FastLoop({
    container: '#largeList',
    template: '#itemTemplate',
    data: largeDataset,
    batchSize: 500,      // Process 500 items per batch
    reuseNodes: true     // Enable DOM recycling
});
```

4. Event Handling:
----------------
```javascript
const fastLoop = new FastLoop({
    container: '#list',
    template: '#template',
    data: items
});
```

```javascript
fastLoop.on('dataUpdated', (newData) => {
    console.log('Data updated:', newData);
});

fastLoop.updateData(newItems);

5. Cleanup:
----------
```javascript
// Vanilla JS
fastLoop.destroy();
```

```javascript
// jQuery
$('#list').data('loopHtml').destroy();
```

CONFIGURATION OPTIONS
-------------------
```javascript
{
    container: null,      // DOM element or selector
    data: [],            // Array of data to render
    template: '',        // Template string or element
    renderCallback: null, // Custom render function
    validateData: true,   // Enable input validation
    batchSize: 1000,     // Items per batch
    reuseNodes: true     // Enable DOM recycling
}
```

PERFORMANCE TIPS
--------------
1. Use Batch Processing: Adjust batchSize based on data complexity
2. Enable DOM Recycling: Set reuseNodes: true for better performance
3. Cache Templates: Use template elements instead of strings
4. Optimize Templates: Keep templates simple and minimize DOM depth
5. Use Custom Render Callbacks: For complex data transformations

BROWSER SUPPORT
-------------
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 (with polyfills)

LICENSE
-------
MIT License

CONTRIBUTING
-----------
Contributions are welcome! Please read contributing guidelines before submitting pull requests.

For more information and updates, visit:
[Your repository URL here]

Questions or issues?
[Your contact information or issue tracker URL]