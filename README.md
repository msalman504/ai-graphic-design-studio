---
title: AI Graphic Designer Studio
emoji: 🎨
colorFrom: blue
colorTo: purple
pinned: false
license: mit
sdk: static
sdk_version: "1.0"
app_file: app.html
---

# AI Graphic Designer Studio

An AI-powered design assistant that collaborates with you to create stunning visuals. Using iterative, layer-like editing, it helps you design social media posts, flyers, and more by understanding your brand's color palette, logo, and intent.

---

## ✨ Key Features

-   **🤖 AI-Powered Design:** Use natural language prompts to generate and edit designs from scratch.
-   **🎨 Brand-Aware:** Upload your logo and brand assets, and the AI will incorporate them into your creations.
-   **🌈 Dynamic Color Palettes:** Choose from preset palettes or automatically extract a color scheme from any image.
-   **🖼️ Versatile Formats:** Create designs for various needs, including square social posts, vertical stories, flyers, and web banners.
-   **🔄 Carousel Creation:** Plan and generate multi-slide carousel posts with a single prompt.
-   **💾 Save & Load:** Persist your entire design session (logo, assets, chat history, and image) to your browser's local storage and resume later.
-   **📱 Fully Responsive:** A seamless experience on both desktop and mobile devices.

## 🚀 How It Works

1.  **Setup Your Brand:**
    -   Upload your logo to serve as the base for your designs.
    -   Upload reusable brand assets (icons, product images, etc.).
    -   Select a preset color palette or upload an image to generate a custom one.

2.  **Choose a Format:**
    -   Select the type of design you want to create (e.g., "Social Post", "Story").

3.  **Chat with Nano, your AI Designer:**
    -   Use the chat panel to describe what you want to create. Be descriptive!
    -   *Example: "Create a vibrant post announcing our summer sale. Use the beach photo asset."*

4.  **Iterate and Refine:**
    -   The AI will generate a design. You can then ask for changes.
    -   *Example: "Make the headline text bigger and change the background to a sunny yellow."*

5.  **Download:**
    -   Once you're happy with the result, click the "Download" button to save your final image.

## 🛠️ Tech Stack

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Model:** Google Gemini API
    -   `gemini-2.5-flash` for chat, planning, and color extraction.
    -   `gemini-2.5-flash-image-preview` for image generation and editing.
-   **Dependencies:** Served via an `importmap` in `index.html` for a build-free setup.

## 🏁 Getting Started

This is a client-side-only application that runs entirely in the browser.

### Prerequisites

-   A modern web browser (Chrome, Firefox, Safari, Edge).
-   A Google Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
-   The API key must be available as an environment variable named `API_KEY` in the execution context where the application is served.

### Running Locally

1.  Place all the project files in a single directory.
2.  Ensure the `API_KEY` environment variable is accessible to your server.
3.  Serve the project folder using a simple local web server. A recommended way is to use the `serve` package:

    ```bash
    # Install serve globally (if you haven't already)
    npm install -g serve

    # Serve the project directory
    serve .
    ```

4.  Open your browser and navigate to the local address provided by the server (e.g., `http://localhost:3000`).

## 📁 Project Structure

```
.
├── README.md                 # This file
├── index.html                # Main HTML entry point, loads Tailwind CSS and the app
├── index.tsx                 # React application root
├── App.tsx                   # Main application component with all state and logic
├── metadata.json             # Project metadata
├── services/
│   └── geminiService.ts      # All interactions with the Google Gemini API
├── components/
│   ├── AssetLibrary.tsx      # Component to display and manage brand assets
│   ├── Canvas.tsx            # The main design canvas area
│   ├── ChatPanel.tsx         # The interactive chat interface
│   ├── ColorPalettePicker.tsx# Component for selecting color palettes
│   ├── ControlPanel.tsx      # The left-side panel with all user controls
│   ├── icons.tsx             # SVG icon components
│   ├── ImageUploader.tsx     # Reusable image upload component
│   └── Toast.tsx             # Success/Error notification component
├── types.ts                  # Shared TypeScript type definitions
└── constants.ts              # App-wide constants (e.g., preset palettes)
```

---

This project was built to demonstrate the powerful capabilities of the Google Gemini API for creative and generative tasks.
