<?php
// Example PHP page with RAG Chat Widget integration
$page_title = "PHP Integration Example";
$current_user = "John Doe"; // Example user data
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title; ?></title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .header {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .welcome {
            color: #333;
            margin-bottom: 2rem;
        }
        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        .card {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .user-info {
            background: #e3f2fd;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: white; margin: 0;"><?php echo $page_title; ?></h1>
    </div>

    <div class="container">
        <div class="user-info">
            <strong>Welcome, <?php echo htmlspecialchars($current_user); ?>!</strong>
            <p>This page demonstrates RAG Chat Widget integration in a PHP application.</p>
        </div>

        <div class="welcome">
            <h2>RAG Chat Assistant Integration</h2>
            <p>This PHP page includes an AI-powered chat assistant that can help answer questions about your documents and provide support.</p>
        </div>

        <div class="content-grid">
            <div class="card">
                <h3>🤖 AI Assistant</h3>
                <p>Click the chat button in the bottom-right corner to start a conversation with our AI assistant.</p>
                <ul>
                    <li>Document-based question answering</li>
                    <li>Real-time responses</li>
                    <li>Context-aware conversations</li>
                </ul>
            </div>

            <div class="card">
                <h3>📚 Knowledge Base</h3>
                <p>The assistant has access to your uploaded documents and can provide accurate information based on them.</p>
                <ul>
                    <li>RAG (Retrieval Augmented Generation)</li>
                    <li>Vector database integration</li>
                    <li>Semantic search capabilities</li>
                </ul>
            </div>

            <div class="card">
                <h3>⚡ Easy Integration</h3>
                <p>Simple one-line integration into any PHP page:</p>
                <code style="background: #fff; padding: 0.5rem; border-radius: 4px; display: block; margin-top: 0.5rem;">
                    &lt;script src="your-domain/chat-widget.js"&gt;&lt;/script&gt;
                </code>
            </div>

            <div class="card">
                <h3>🎨 Customizable</h3>
                <p>Customize the appearance and behavior:</p>
                <ul>
                    <li>Position (corners)</li>
                    <li>Colors and styling</li>
                    <li>Size and dimensions</li>
                    <li>Custom titles</li>
                </ul>
            </div>
        </div>

        <?php
        // Dynamic content example
        $features = [
            "Responsive design",
            "Mobile-friendly",
            "No external dependencies",
            "Privacy-focused",
            "Fast loading"
        ];
        ?>

        <div style="margin-top: 2rem; padding: 1.5rem; background: #f0f9ff; border-radius: 8px;">
            <h3>🌟 Features</h3>
            <ul>
                <?php foreach($features as $feature): ?>
                    <li><?php echo htmlspecialchars($feature); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>

        <div style="margin-top: 2rem; text-align: center; color: #666;">
            <p>Try clicking the chat button to test the integration!</p>
            <small>Generated at: <?php echo date('Y-m-d H:i:s'); ?></small>
        </div>
    </div>

    <!-- RAG Chat Widget Integration -->
    <!-- Replace localhost:3000 with your actual domain -->
    <script>
        // Custom configuration for this page
        window.addEventListener('DOMContentLoaded', function() {
            // You can customize the widget for this specific page
            if (window.RAGChatWidget) {
                window.RAGChatWidget.init({
                    baseUrl: 'http://localhost:3000', // Change to your domain
                    position: 'bottom-right',
                    buttonColor: '#2563eb',
                    title: 'Support Assistant',
                    maxWidth: '450px',
                    maxHeight: '650px'
                });
            }
        });
    </script>
    <script src="http://localhost:3000/chat-widget.js"></script>
</body>
</html>
