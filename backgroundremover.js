import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';

// Input and output directory paths
const inputDir = './test';
const outputDir = './test/output';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function removeBackground(inputPath, outputPath) {
    try {
        const image = await Jimp.read(inputPath);
        
        // Process each pixel
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            // Get RGB values
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];
            
            // More robust black background detection
            // Check if the color is very dark (close to black)
            // and if RGB values are close to each other (indicating a gray/black tone)
            const threshold = 30;
            const tolerance = 15;
            const isVeryDark = red < threshold && green < threshold && blue < threshold;
            const isCloseToEqual = Math.abs(red - green) < tolerance && 
                                 Math.abs(green - blue) < tolerance && 
                                 Math.abs(red - blue) < tolerance;
            
            if (isVeryDark && isCloseToEqual) {
                // Set pixel to transparent
                this.bitmap.data[idx + 3] = 0;
            }
        });

        // Save the processed image
        await image.writeAsync(outputPath);  // Changed to writeAsync for better compatibility
        return true;
    } catch (error) {
        throw error;
    }
}

async function processImages() {
    try {
        const files = fs.readdirSync(inputDir);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png)$/i.test(file)
        );

        if (imageFiles.length === 0) {
            console.log('No image files found in the test directory');
            return;
        }

        console.log(`Found ${imageFiles.length} images to process`);

        for (const file of imageFiles) {
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, `no-bg-${file.replace(/\.[^/.]+$/, '')}.png`);
            console.log(`Processing: ${file}`);
            await removeBackground(inputPath, outputPath);
            console.log(`Successfully processed: ${file}`);
        }

        console.log('All images processed successfully!');
    } catch (error) {
        console.error('Error processing directory:', error.message);
    }
}

// Run the script
processImages();