class ImageGallery {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.itemsPerPage = 50; // Increased items per page
        this.filteredImages = [];
        this.currentFilter = '';
        this.currentSearch = '';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadImages();
        this.displayImages();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.filterImages();
        });

        // Filter functionality
        document.getElementById('filterSelect').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterImages();
        });

        // Load more button (hidden since we show all images)
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreImages();
            });
        }

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async loadImages() {
        const loading = document.getElementById('loading');
        const progressInfo = document.getElementById('progressInfo');
        loading.style.display = 'block';

        try {
            // Load images from the server API
            progressInfo.textContent = 'Loading images and metadata...';
            const response = await fetch('/api/images');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const imageData = await response.json();
            progressInfo.textContent = `Loaded ${imageData.length} images with metadata.`;
            
            // Transform the data to match our expected format
            this.images = imageData.map(item => ({
                id: item.id,
                imagePath: item.image,
                metadata: item.metadata
            }));
            
            this.filteredImages = [...this.images];
            
            // Update image count
            const imageCount = document.getElementById('imageCount');
            if (imageCount) {
                imageCount.textContent = `${this.images.length} images`;
            }
            
        } catch (error) {
            console.error('Error loading images:', error);
            progressInfo.textContent = 'Error loading images. Please try again.';
        } finally {
            loading.style.display = 'none';
        }
    }

    filterImages() {
        this.filteredImages = this.images.filter(image => {
            let matchesSearch = true;
            let matchesFilter = true;

            // Search functionality
            if (this.currentSearch) {
                const searchableText = JSON.stringify(image.metadata).toLowerCase();
                matchesSearch = searchableText.includes(this.currentSearch);
            }

            // Filter functionality
            if (this.currentFilter) {
                const metadata = image.metadata;
                const name = metadata['table data left']?.Name || '';
                const color = metadata['table data right']?.Color || '';
                matchesFilter = name.includes(this.currentFilter) || color.includes(this.currentFilter);
            }

            return matchesSearch && matchesFilter;
        });

        this.currentIndex = 0;
        this.displayImages();
    }

    displayImages() {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        // Display all filtered images (no pagination)
        this.filteredImages.forEach(image => {
            const galleryItem = this.createGalleryItem(image);
            gallery.appendChild(galleryItem);
        });

        // Update image count for filtered results
        const imageCount = document.getElementById('imageCount');
        if (imageCount) {
            imageCount.textContent = `${this.filteredImages.length} images`;
        }
    }

    createGalleryItem(image) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const metadata = image.metadata;
        const name = metadata['table data left']?.Name || 'Unknown';
        const color = metadata['table data right']?.Color || 'Unknown';
        
        item.innerHTML = `
            <div class="image-container">
                <img src="${image.imagePath}" alt="${name}" loading="lazy">
                <div class="image-overlay">
                    <div class="image-info">
                        <h3>${name}</h3>
                        <p>Color: ${color}</p>
                        <p>ID: ${image.id}</p>
                    </div>
                </div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.openModal(image);
        });
        
        return item;
    }

    openModal(image) {
        const modal = document.getElementById('modal');
        const modalImage = document.getElementById('modalImage');
        const metadataContent = document.getElementById('metadataContent');
        
        modalImage.src = image.imagePath;
        modalImage.alt = `Image ${image.id}`;
        
        metadataContent.innerHTML = this.formatMetadata(image.metadata);
        
        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
    }

    formatMetadata(metadata) {
        let html = '';
        
        // Helper function to safely get nested object values
        const getValue = (obj, path) => {
            return path.split('.').reduce((current, key) => current?.[key], obj);
        };
        
        // Format table data left
        if (metadata['table data left']) {
            html += '<div class="metadata-section">';
            html += '<h4>Product Information</h4>';
            html += '<table>';
            
            const leftData = metadata['table data left'];
            for (const [key, value] of Object.entries(leftData)) {
                if (value && typeof value === 'string' && value.trim() !== '') {
                    html += `
                        <tr>
                            <td><strong>${this.formatLabel(key)}</strong></td>
                            <td>${value}</td>
                        </tr>
                    `;
                }
            }
            html += '</table>';
            html += '</div>';
        }
        
        // Format table data right
        if (metadata['table data right']) {
            html += '<div class="metadata-section">';
            html += '<h4>Additional Details</h4>';
            html += '<table>';
            
            const rightData = metadata['table data right'];
            for (const [key, value] of Object.entries(rightData)) {
                if (value && typeof value === 'string' && value.trim() !== '') {
                    html += `
                        <tr>
                            <td><strong>${this.formatLabel(key)}</strong></td>
                            <td>${value}</td>
                        </tr>
                    `;
                }
            }
            html += '</table>';
            html += '</div>';
        }
        
        // Format any other metadata
        const otherKeys = Object.keys(metadata).filter(key => 
            key !== 'table data left' && key !== 'table data right'
        );
        
        if (otherKeys.length > 0) {
            html += '<div class="metadata-section">';
            html += '<h4>Other Information</h4>';
            html += '<table>';
            
            for (const key of otherKeys) {
                const value = metadata[key];
                if (value && typeof value === 'string' && value.trim() !== '') {
                    html += `
                        <tr>
                            <td><strong>${this.formatLabel(key)}</strong></td>
                            <td>${value}</td>
                        </tr>
                    `;
                }
            }
            html += '</table>';
            html += '</div>';
        }
        
        return html || '<p>No metadata available</p>';
    }

    formatLabel(key) {
        return key.replace(/([A-Z])/g, ' $1')
                 .replace(/^./, str => str.toUpperCase())
                 .trim();
    }

    loadMoreImages() {
        // This function is kept for compatibility but not used since we show all images
        this.currentIndex += this.itemsPerPage;
        this.displayImages();
    }
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageGallery();
}); 