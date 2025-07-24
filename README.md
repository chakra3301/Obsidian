# Image Gallery with Metadata

A modern, responsive web gallery that displays images with their corresponding metadata from JSON files.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Search & Filter**: Search by name, color, or location. Filter by substance type
- **Modal View**: Click on any image to see it in full size with detailed metadata
- **Lazy Loading**: Images load as you scroll for better performance
- **Modern UI**: Beautiful gradient design with smooth animations

## Installation

1. Make sure you have Node.js installed on your system
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## File Structure

The application expects the following structure:
```
scrapper/
├── images/          # Image files (1.jpg, 2.jpg, etc.)
├── json/           # Metadata files (1.json, 2.json, etc.)
├── index.html      # Main gallery page
├── styles.css      # Styling
├── script.js       # Gallery functionality
├── server.js       # Express server
└── package.json    # Dependencies
```

## How It Works

1. **Image-Metadata Matching**: The gallery automatically matches images with their corresponding JSON metadata files by number (e.g., `1.jpg` with `1.json`)

2. **Server API**: The Express server provides endpoints to:
   - Get all available images and metadata
   - Search and filter images
   - Serve static files

3. **Frontend Features**:
   - **Search**: Type in the search box to find images by name, color, or location
   - **Filter**: Use the dropdown to filter by substance type
   - **Load More**: Click "Load More" to see additional images
   - **Modal View**: Click any image to see full details

## API Endpoints

- `GET /api/images` - Get all available images
- `GET /api/metadata/:id` - Get metadata for a specific image
- `GET /api/search?query=&filter=` - Search and filter images

## Customization

### Adding More Images
Simply add more numbered image files to the `images/` directory and their corresponding JSON metadata files to the `json/` directory.

### Styling
Modify `styles.css` to customize the appearance:
- Change colors in the CSS variables
- Adjust grid layout in `.gallery`
- Modify modal appearance

### Functionality
Edit `script.js` to:
- Change items per page (`this.itemsPerPage`)
- Modify search/filter logic
- Add new features

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Notes

- Images are loaded lazily for better performance
- The gallery limits initial load to prevent overwhelming the browser
- Server-side filtering reduces client-side processing
- Responsive images adapt to different screen sizes 