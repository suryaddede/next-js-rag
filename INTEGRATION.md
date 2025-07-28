# RAG Chat Widget Integration Guide

This guide explains how to integrate the RAG Chat Widget into your PHP webpages.

## Quick Start

### Method 1: JavaScript Widget (Recommended)

Add this single line to your PHP page:

```html
<script src="http://your-domain.com/chat-widget.js"></script>
```

### Method 2: iframe Integration

For simpler integration without JavaScript:

```html
<iframe
  src="http://your-domain.com/embed"
  style="position: fixed; bottom: 0; right: 0; width: 100vw; height: 100vh; border: none; pointer-events: none; z-index: 1000;"
  onload="this.style.pointerEvents='auto'"
>
</iframe>
```

## Configuration Options

### JavaScript Widget Configuration

```javascript
<script>
window.RAGChatWidget.init({
    baseUrl: 'http://your-domain.com',
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    buttonColor: '#2563eb',
    title: 'Chat Assistant',
    maxWidth: '450px',
    maxHeight: '650px',
    zIndex: 1000
});
</script>
```

### Available Positions

- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

## PHP Integration Examples

### Basic Integration

```php
<?php
$page_title = "My Page";
?>
<!DOCTYPE html>
<html>
<head>
    <title><?php echo $page_title; ?></title>
</head>
<body>
    <h1>Welcome to my site</h1>

    <!-- Your PHP content here -->

    <!-- Chat Widget -->
    <script src="http://your-domain.com/chat-widget.js"></script>
</body>
</html>
```

### Advanced Integration with Custom Config

```php
<!DOCTYPE html>
<html>
<head>
    <title>My Site</title>
</head>
<body>
    <!-- Your content -->

    <script>
    // Custom configuration
    window.addEventListener('DOMContentLoaded', function() {
        if (window.RAGChatWidget) {
            window.RAGChatWidget.init({
                baseUrl: 'http://your-domain.com',
                position: 'bottom-left',
                buttonColor: '#059669',
                title: 'Support Chat'
            });
        }
    });
    </script>
    <script src="http://your-domain.com/chat-widget.js"></script>
</body>
</html>
```

## Setup Instructions

1. **Deploy your Next.js app** to your server
2. **Update the domain** in `chat-widget.js` from `localhost:3000` to your actual domain
3. **Add the script tag** to your PHP pages
4. **Test the integration** by clicking the chat button

## Customization

### Styling

The widget is fully self-contained and won't conflict with your existing CSS. It uses:

- Fixed positioning
- High z-index (1000 by default)
- Isolated styling

### Colors

You can customize the button color using the `buttonColor` option:

```javascript
buttonColor: '#059669'; // Green
buttonColor: '#dc2626'; // Red
buttonColor: '#7c3aed'; // Purple
```

### Size

Adjust the popup size:

```javascript
maxWidth: '500px';
maxHeight: '700px';
```

## Features

- 🤖 **AI-Powered**: Uses RAG (Retrieval Augmented Generation)
- 📱 **Responsive**: Works on desktop and mobile
- 🎨 **Customizable**: Configurable colors, position, and size
- ⚡ **Fast**: Lightweight and optimized
- 🔒 **Secure**: No external dependencies
- 🌐 **Universal**: Works with any PHP/HTML page

## API Endpoints

The widget communicates with these endpoints:

- `/embed` - The embeddable chat interface
- `/api/chat` - Chat API endpoint
- `/chat-widget.js` - Widget JavaScript file

## Troubleshooting

### Widget not appearing

- Check that the script URL is correct
- Verify your domain is accessible
- Check browser console for errors

### CORS Issues

If you're hosting on a different domain, make sure your Next.js app allows cross-origin requests.

### Mobile Issues

The widget is responsive, but you might want to adjust the size for mobile:

```javascript
// Responsive sizing
const isMobile = window.innerWidth < 768;
window.RAGChatWidget.init({
  maxWidth: isMobile ? '100vw' : '450px',
  maxHeight: isMobile ? '100vh' : '650px',
});
```

## Examples

Check the included example files:

- `integration-example.html` - Basic HTML example
- `example.php` - PHP integration example

## Support

For issues or questions about the RAG Chat Widget integration, please check the documentation or contact support.
