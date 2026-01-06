# Pixel Structure Transformer

A web application that transforms pixel structures by rearranging colors from one image to match the luminance-based structure of another image.

## Features

- **Pixel Rearrangement**: Rearrange pixels from an object image to match the structure of a subject image based on luminance ranking
- **Real-time Animation**: Watch the transformation happen in real-time with smooth animations
- **Interactive Controls**: Adjust pixel block size for different levels of detail
- **High-Res Download**: Export the transformed image

## How It Works

1. **Subject Image**: Provides the structural composition and lighting map
2. **Object Image**: Provides the color palette
3. **Transformation**: Pixels are rearranged based on luminance ranking to create a fusion of structure and color

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Upload a **Subject Image** (provides structure & lighting)
2. Upload an **Object Image** (provides colors/palette)
3. Adjust the **Pixel Block Size** slider (smaller = finer detail, larger = abstract)
4. Click **Generate** to start the transformation
5. Watch the animated result
6. Download the high-resolution result

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Animation**: Canvas-based pixel animation
