# Deploy to GitHub Pages

## Quick Setup Instructions

1. **Go to your repository**: https://github.com/chakra3301/Obsidian

2. **Enable GitHub Pages**:
   - Click "Settings" tab
   - Scroll down to "Pages" in left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Wait for deployment** (usually 2-5 minutes)

4. **Your site will be available at**: 
   `https://chakra3301.github.io/Obsidian/static-home.html`

## Alternative: Deploy to Netlify

1. **Go to**: https://netlify.com
2. **Sign up/Login** with GitHub
3. **Click "New site from Git"**
4. **Choose GitHub** and select your repository
5. **Deploy settings**:
   - Build command: (leave empty)
   - Publish directory: `.`
6. **Click "Deploy site"**

## Files Included

- ✅ `static-home.html` - 3D model with HDRI skybox
- ✅ `static-gallery.html` - Image gallery with sample data
- ✅ `assets/` - 3D models and textures
- ✅ `images/` - Sample images (923.jpg, 924.jpg)
- ✅ `styles.css` - Gallery styling
- ✅ `home-styles.css` - Home page styling

## Features

- **Home Page**: 3D model with cursor tracking and rotating HDRI skybox
- **Gallery Page**: Sample marketplace with search and filtering
- **Modern UI**: Dark theme with Chakra Petch font
- **Responsive**: Works on mobile and desktop

## Next Steps

Once deployed, you can:
1. Add more images to the `images/` folder
2. Update the sample data in `static-gallery.html`
3. Customize the styling in the CSS files
4. Add more 3D models to the `assets/` folder 