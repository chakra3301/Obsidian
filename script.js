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
            progressInfo.textContent = 'Getting image list...';
            const response = await fetch('/api/images');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const availableImages = await response.json();
            progressInfo.textContent = `Found ${availableImages.length} images. Loading metadata...`;
            
            // Load metadata for each image (all of them)
            const metadataPromises = availableImages.map(async (image, index) => {
                try {
                    const metadataResponse = await fetch(`/api/metadata/${image.id}`);
                    if (metadataResponse.ok) {
                        const metadata = await metadataResponse.json();
                        
                        // Update progress every 10 images
                        if (index % 10 === 0) {
                            progressInfo.textContent = `Loading metadata... ${index + 1}/${availableImages.length}`;
                        }
                        
                        return {
                            id: image.id,
                            imagePath: image.imagePath,
                            metadata: metadata
                        };
                    }
                } catch (error) {
                    console.log(`Error loading metadata for image ${image.id}: ${error.message}`);
                    return null;
                }
            });
            
            // Wait for all metadata to load
            const results = await Promise.all(metadataPromises);
            this.images = results.filter(result => result !== null);
            
            // Initialize filtered images
            this.filteredImages = [...this.images];
            
            progressInfo.textContent = `Loaded ${this.images.length} images successfully!`;
            console.log(`Loaded ${this.images.length} images with metadata`);
        } catch (error) {
            console.error('Error loading images:', error);
            progressInfo.textContent = 'Error loading images. Please refresh the page.';
        } finally {
            setTimeout(() => {
                loading.style.display = 'none';
            }, 1000); // Show success message for 1 second
        }
    }

    filterImages() {
        this.filteredImages = this.images.filter(image => {
            const metadata = image.metadata;
            if (!metadata) return false;

            const searchMatch = !this.currentSearch || 
                (metadata['table data left']?.Name?.toLowerCase().includes(this.currentSearch) ||
                 metadata['table data right']?.Color?.toLowerCase().includes(this.currentSearch) ||
                 metadata['table data right']?.Src?.toLowerCase().includes(this.currentSearch));

            const filterMatch = !this.currentFilter || 
                (metadata['table data left']?.Name?.includes(this.currentFilter) ||
                 metadata['table data right']?.Color?.includes(this.currentFilter) ||
                 (metadata['table data left']?.list_5 && 
                  metadata['table data left'].list_5.some(item => item.includes(this.currentFilter))));

            return searchMatch && filterMatch;
        });

        this.currentIndex = 0;
        this.displayImages();
    }

    displayImages() {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = ''; // Clear gallery

        // Display all filtered images at once
        this.filteredImages.forEach(image => {
            const item = this.createGalleryItem(image);
            gallery.appendChild(item);
        });

        // Hide load more button since we're showing all images
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
        
        // Update image count
        const imageCount = document.getElementById('imageCount');
        if (imageCount) {
            imageCount.textContent = `${this.filteredImages.length} images`;
        }
        
        console.log(`Displayed ${this.filteredImages.length} images`);
    }

    createGalleryItem(image) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.addEventListener('click', () => this.openModal(image));

        const metadata = image.metadata;
        const name = metadata['table data left']?.Name || 'Unknown';
        const color = metadata['table data right']?.Color || 'Unknown';
        const location = metadata['table data right']?.Src || 'Unknown';
        const testDate = metadata['table data right']?.['Test Date'] || 'Unknown';

        item.innerHTML = `
            <img src="${image.imagePath}" alt="${name}" loading="lazy">
            <div class="item-info">
                <h3>${name}</h3>
                <p class="image-number">#${image.id}</p>
                <p><strong>Color:</strong> ${color}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Test Date:</strong> ${testDate}</p>
                <div class="tags">
                    <span class="tag">${name}</span>
                    <span class="tag">${color.split(' ')[0]}</span>
                </div>
            </div>
        `;

        return item;
    }

    openModal(image) {
        const modal = document.getElementById('modal');
        const modalImage = document.getElementById('modalImage');
        const metadataContent = document.getElementById('metadataContent');

        modalImage.src = image.imagePath;
        modalImage.alt = image.metadata['table data left']?.Name || 'Image';

        // Display metadata
        metadataContent.innerHTML = this.formatMetadata(image.metadata);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    formatMetadata(metadata) {
        let html = '';

        // Left table data
        if (metadata['table data left']) {
            html += '<div class="metadata-section">';
            html += '<h4>Substance Information</h4>';
            const leftData = metadata['table data left'];
            
            for (const [key, value] of Object.entries(leftData)) {
                if (key !== 'list_5') {
                    html += `
                        <div class="metadata-item">
                            <span class="metadata-label">${this.formatLabel(key)}</span>
                            <span class="metadata-value">${value || 'Not Available'}</span>
                        </div>
                    `;
                }
            }
            html += '</div>';
        }

        // Right table data
        if (metadata['table data right']) {
            html += '<div class="metadata-section">';
            html += '<h4>Test Information</h4>';
            const rightData = metadata['table data right'];
            
            for (const [key, value] of Object.entries(rightData)) {
                html += `
                    <div class="metadata-item">
                        <span class="metadata-label">${this.formatLabel(key)}</span>
                        <span class="metadata-value">${value || 'Not Available'}</span>
                    </div>
                `;
            }
            html += '</div>';
        }

        // List data (if exists)
        if (metadata['table data left']?.list_5) {
            html += '<div class="metadata-section">';
            html += '<h4>Test Results</h4>';
            metadata['table data left'].list_5.forEach((item, index) => {
                html += `
                    <div class="metadata-item">
                        <span class="metadata-label">Result ${index + 1}</span>
                        <span class="metadata-value">${item}</span>
                    </div>
                `;
            });
            html += '</div>';
        }

        return html;
    }

    formatLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/:/g, '');
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