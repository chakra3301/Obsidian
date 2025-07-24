const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('.'));

// API endpoint to get available images and metadata
app.get('/api/images', async (req, res) => {
    try {
        const imagesDir = path.join(__dirname, 'images');
        const jsonDir = path.join(__dirname, 'json');
        
        // Get all image files
        const imageFiles = await fs.readdir(imagesDir);
        const jsonFiles = await fs.readdir(jsonDir);
        
        // Create sets for faster lookup
        const imageSet = new Set(imageFiles);
        const jsonSet = new Set(jsonFiles);
        
        const availableImages = [];
        
        // Find matching pairs of images and JSON files
        for (const imageFile of imageFiles) {
            if (imageFile.endsWith('.jpg')) {
                const imageNumber = imageFile.replace('.jpg', '');
                const imageId = parseInt(imageNumber);
                
                // Only include images from 923 and beyond
                if (imageId >= 923) {
                    const jsonFile = `${imageNumber}.json`;
                    
                    // Only include if both image and JSON exist
                    if (jsonSet.has(jsonFile)) {
                        availableImages.push({
                            id: imageId,
                            imagePath: `/images/${imageFile}`,
                            metadataPath: `/json/${jsonFile}`
                        });
                    }
                }
            }
        }
        
        // Sort by ID
        availableImages.sort((a, b) => a.id - b.id);
        
        console.log(`Found ${availableImages.length} image-metadata pairs from 923+ out of ${imageFiles.length} total images and ${jsonFiles.length} JSON files`);
        console.log(`Image range: ${Math.min(...availableImages.map(img => img.id))} to ${Math.max(...availableImages.map(img => img.id))}`);
        res.json(availableImages);
    } catch (error) {
        console.error('Error getting images:', error);
        res.status(500).json({ error: 'Failed to get images' });
    }
});

// API endpoint to get metadata for a specific image
app.get('/api/metadata/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const metadataPath = path.join(__dirname, 'json', `${id}.json`);
        
        const metadata = await fs.readFile(metadataPath, 'utf8');
        res.json(JSON.parse(metadata));
    } catch (error) {
        console.error('Error getting metadata:', error);
        res.status(404).json({ error: 'Metadata not found' });
    }
});

// API endpoint to search/filter images
app.get('/api/search', async (req, res) => {
    try {
        const { query, filter } = req.query;
        const imagesDir = path.join(__dirname, 'images');
        const jsonDir = path.join(__dirname, 'json');
        
        const imageFiles = await fs.readdir(imagesDir);
        const jsonFiles = await fs.readdir(jsonDir);
        
        // Create sets for faster lookup
        const jsonSet = new Set(jsonFiles);
        
        const results = [];
        
        for (const imageFile of imageFiles) {
            if (imageFile.endsWith('.jpg')) {
                const imageNumber = imageFile.replace('.jpg', '');
                const imageId = parseInt(imageNumber);
                
                // Only include images from 923 and beyond
                if (imageId >= 923) {
                    const jsonFile = `${imageNumber}.json`;
                    
                    if (jsonSet.has(jsonFile)) {
                        try {
                            const metadataPath = path.join(__dirname, 'json', jsonFile);
                            const metadataContent = await fs.readFile(metadataPath, 'utf8');
                            const metadata = JSON.parse(metadataContent);
                            
                            // Apply search filter
                            let matches = true;
                            
                            if (query) {
                                const searchTerm = query.toLowerCase();
                                const name = metadata['table data left']?.Name?.toLowerCase() || '';
                                const color = metadata['table data right']?.Color?.toLowerCase() || '';
                                const location = metadata['table data right']?.Src?.toLowerCase() || '';
                                
                                matches = name.includes(searchTerm) || 
                                         color.includes(searchTerm) || 
                                         location.includes(searchTerm);
                            }
                            
                            if (filter && matches) {
                                const filterTerm = filter.toLowerCase();
                                const name = metadata['table data left']?.Name?.toLowerCase() || '';
                                const color = metadata['table data right']?.Color?.toLowerCase() || '';
                                
                                matches = name.includes(filterTerm) || color.includes(filterTerm);
                            }
                            
                            if (matches) {
                                results.push({
                                    id: imageId,
                                    imagePath: `/images/${imageFile}`,
                                    metadata: metadata
                                });
                            }
                        } catch (error) {
                            console.log(`Error processing ${jsonFile}:`, error.message);
                        }
                    }
                }
            }
        }
        
        res.json(results);
    } catch (error) {
        console.error('Error searching images:', error);
        res.status(500).json({ error: 'Failed to search images' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Home page available at http://localhost:${PORT}/home.html`);
    console.log(`Gallery available at http://localhost:${PORT}/index.html`);
}); 