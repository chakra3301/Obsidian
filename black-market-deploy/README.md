# Black Market - Image Gallery

A futuristic image gallery with 3D models and HDRI skybox.

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from this directory**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Choose your scope
   - Set project name (e.g., "black-market")
   - Confirm settings

### Option 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import from Git** (if you push to GitHub) or **Upload Files**
4. **Select this directory**
5. **Deploy**

## 📁 Project Structure

```
black-market-deploy/
├── home.html          # 3D model page with skybox
├── index.html         # Image gallery
├── server.js          # Node.js server
├── script.js          # Gallery functionality
├── styles.css         # Gallery styling
├── home-styles.css    # Home page styling
├── vercel.json        # Vercel configuration
├── package.json       # Dependencies
├── assets/            # 3D models, textures, etc.
├── images/            # Sample images (100 images)
└── json/              # Metadata files
```

## 🌐 Live URLs

After deployment, your site will be available at:
- **Home**: `https://your-project.vercel.app/`
- **Gallery**: `https://your-project.vercel.app/gallery`

## 🎨 Features

- **3D Model**: Interactive 3D logo with cursor tracking
- **HDRI Skybox**: Rotating environment background
- **Image Gallery**: 100 sample images with metadata
- **Search & Filter**: Find images by name, color, etc.
- **Dark Theme**: Futuristic styling with Orbitron font

## 📊 Current Content

- **100 images** (IDs 923-1022)
- **100 JSON metadata files**
- **3D models**: `33.glb`, `hdri.jpeg` skybox
- **Responsive design** for all devices

## 🔧 Customization

To add more images:
1. Copy more `.jpg` files to `images/`
2. Copy corresponding `.json` files to `json/`
3. Redeploy with `vercel --prod`

## 🛠️ Local Development

```bash
npm install
npm start
```

Visit `http://localhost:3000` to see the site locally. 