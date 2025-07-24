const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// API endpoint to get images
app.get('/api/images', async (req, res) => {
    try {
        const imagesDir = path.join(__dirname, 'images');
        const jsonDir = path.join(__dirname, 'json');
        
        if (!fs.existsSync(imagesDir) || !fs.existsSync(jsonDir)) {
            console.log('Directories not found:', { imagesDir, jsonDir });
            return res.json([]);
        }

        const imageFiles = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpg'));
        const jsonFiles = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));

        console.log(`Found ${imageFiles.length} images and ${jsonFiles.length} JSON files`);

        const imageMetadataPairs = [];

        for (const imageFile of imageFiles) {
            const imageId = path.parse(imageFile).name;
            const jsonFile = `${imageId}.json`;
            
            if (jsonFiles.includes(jsonFile)) {
                try {
                    const jsonPath = path.join(jsonDir, jsonFile);
                    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
                    const metadata = JSON.parse(jsonContent);
                    
                    imageMetadataPairs.push({
                        id: imageId,
                        image: `/images/${imageFile}`,
                        metadata: metadata
                    });
                } catch (error) {
                    console.error(`Error reading JSON for ${imageId}:`, error.message);
                }
            }
        }

        console.log(`Successfully paired ${imageMetadataPairs.length} images with metadata`);
        
        // Sort by ID numerically
        imageMetadataPairs.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        
        res.json(imageMetadataPairs);
    } catch (error) {
        console.error('Error in /api/images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to get metadata for a specific image
app.get('/api/metadata/:id', (req, res) => {
    try {
        const imageId = req.params.id;
        const jsonPath = path.join(__dirname, 'json', `${imageId}.json`);
        
        if (fs.existsSync(jsonPath)) {
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');
            const metadata = JSON.parse(jsonContent);
            res.json(metadata);
        } else {
            res.status(404).json({ error: 'Metadata not found' });
        }
    } catch (error) {
        console.error('Error in /api/metadata:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint for search
app.get('/api/search', (req, res) => {
    try {
        const query = req.query.q?.toLowerCase();
        if (!query) {
            return res.json([]);
        }

        const imagesDir = path.join(__dirname, 'images');
        const jsonDir = path.join(__dirname, 'json');
        
        if (!fs.existsSync(imagesDir) || !fs.existsSync(jsonDir)) {
            return res.json([]);
        }

        const imageFiles = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpg'));
        const jsonFiles = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));
        const results = [];

        for (const imageFile of imageFiles) {
            const imageId = path.parse(imageFile).name;
            const jsonFile = `${imageId}.json`;
            
            if (jsonFiles.includes(jsonFile)) {
                try {
                    const jsonPath = path.join(jsonDir, jsonFile);
                    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
                    const metadata = JSON.parse(jsonContent);
                    
                    // Search in metadata
                    const searchableText = JSON.stringify(metadata).toLowerCase();
                    if (searchableText.includes(query)) {
                        results.push({
                            id: imageId,
                            image: `/images/${imageFile}`,
                            metadata: metadata
                        });
                    }
                } catch (error) {
                    console.error(`Error searching JSON for ${imageId}:`, error.message);
                }
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Error in /api/search:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Home page available at http://localhost:${PORT}/home.html`);
    console.log(`Gallery available at http://localhost:${PORT}/index.html`);
}); 