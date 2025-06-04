
      
const API_BASE = 'https://fastrestapis.fasturl.cloud/downup/igdown/advanced';
let currentData = null;

// Enhanced Enter key functionality
document.getElementById('urlInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('downloadBtn').click();
        this.blur();
    }
});

// Premium number formatting
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function extractInstagramUrl(input) {
    // Clean the URL and extract the shortcode
    const patterns = [
        /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) {
            return `https://www.instagram.com/p/${match[1]}/`;
        }
    }
    
    return input;
}

// Ultra Premium Image Lightbox Functions
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightboxOverlay');
    const lightboxImage = document.getElementById('lightboxImage');
    
    lightboxImage.src = imageSrc;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightboxOverlay');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close lightbox when clicking outside the image
document.getElementById('lightboxOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

// Ultra Premium Alert Function
function showAlert() {
    const alertModal = document.getElementById('alertModal');
    alertModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAlert() {
    const alertModal = document.getElementById('alertModal');
    alertModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Focus on input after closing alert
    document.getElementById('urlInput').focus();
}

// Close alert when clicking outside
document.getElementById('alertModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAlert();
    }
});

// Enhanced keyboard controls
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const lightbox = document.getElementById('lightboxOverlay');
        const alertModal = document.getElementById('alertModal');
        const authorModal = document.getElementById('authorModal');
        
        if (lightbox.style.display === 'flex') {
            closeLightbox();
        } else if (alertModal.style.display === 'flex') {
            closeAlert();
        } else if (authorModal.style.display === 'flex') {
            closeAuthorModal();
        }
    }
});

function showAuthorModal() {
    if (!currentData || !currentData.owner) {
        showAlert();
        return;
    }

    const modal = document.getElementById('authorModal');
    const data = currentData;

    // Populate modal with enhanced author data (without avatar)
    document.getElementById('authorName').textContent = data.owner.full_name || 'Unknown';
    document.getElementById('authorUsername').textContent = '@' + (data.owner.username || 'unknown');
    document.getElementById('likeCount').textContent = formatNumber(data.like_count || 0);
    document.getElementById('commentCount').textContent = formatNumber(data.comment_count || 0);
    document.getElementById('followerCount').textContent = formatNumber(data.owner.edge_followed_by?.count || 0);
    document.getElementById('postCount').textContent = formatNumber(data.owner.edge_owner_to_timeline_media?.count || 0);

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAuthorModal() {
    const modal = document.getElementById('authorModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Enhanced modal controls
document.getElementById('authorModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAuthorModal();
    }
});

function createMediaDisplay(url, type, index) {
    if (type === 'video') {
        return `
            <div class="download-item">
                <button class="download-btn-media" onclick="window.open('${url}', '_blank')">
                    <div class="download-icon">🎥</div>
                    <div class="download-text">
                        <div class="download-title">Download Video ${index}</div>
                        <div class="download-subtitle">Click to open video link</div>
                    </div>
                    <div class="download-arrow">→</div>
                </button>
            </div>
        `;
    } else {
        return `
            <div class="download-item">
                <button class="download-btn-media" onclick="window.open('${url}', '_blank')">
                    <div class="download-icon">📸</div>
                    <div class="download-text">
                        <div class="download-title">Download Photo ${index}</div>
                        <div class="download-subtitle">Click to open photo link</div>
                    </div>
                    <div class="download-arrow">→</div>
                </button>
            </div>
        `;
    }
}

function downloadMedia(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    const actionButtons = document.getElementById('actionButtons');
    const result = data.result;
    
    currentData = result;
    
    let mediaHTML = '';
    let mediaCount = 0;
    
    // Only use images and videos arrays
    if (result.videos && result.videos.length > 0) {
        result.videos.forEach((video) => {
            mediaHTML += createMediaDisplay(video, 'video', ++mediaCount);
        });
    }
    
    if (result.images && result.images.length > 0) {
        result.images.forEach((image) => {
            mediaHTML += createMediaDisplay(image, 'photo', ++mediaCount);
        });
    }
    
    // Show action buttons
    let buttonsHTML = `
        <button class="action-btn author-btn" onclick="showAuthorModal()">
            👤 Author Profile
        </button>
    `;
    actionButtons.innerHTML = buttonsHTML;
    actionButtons.style.display = 'flex';
    
    const html = `
        <div class="post-info">
            <div class="media-grid">
                ${mediaHTML}
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

async function downloadInstagram() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    const resultsContainer = document.getElementById('results');
    const actionButtons = document.getElementById('actionButtons');
    const processingElement = document.getElementById('processing');
    
    resultsContainer.innerHTML = '';
    actionButtons.innerHTML = '';
    actionButtons.style.display = 'none';
    processingElement.style.display = 'block';
    currentData = null;
    
    if (!url) {
        showAlert();
        processingElement.style.display = 'none';
        return;
    }
    
    if (!url.includes('instagram.com')) {
        showAlert();
        processingElement.style.display = 'none';
        return;
    }
    
    const cleanUrl = extractInstagramUrl(url);
    
    try {
        const response = await fetch(`${API_BASE}?url=${encodeURIComponent(cleanUrl)}&type=detail`);
        const data = await response.json();
        
        if (data.status === 200 && data.content === 'Success') {
            displayResults(data);
        } else {
            resultsContainer.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 50px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(102, 126, 234, 0.08) 100%); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 24px; font-size: 1.3em; font-weight: 600; backdrop-filter: blur(15px); box-shadow: 0 20px 50px rgba(239, 68, 68, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.1);">Failed to fetch Instagram post. Please check the URL and try again.</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 50px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(102, 126, 234, 0.08) 100%); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 24px; font-size: 1.3em; font-weight: 600; backdrop-filter: blur(15px); box-shadow: 0 20px 50px rgba(239, 68, 68, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.1);">An error occurred while processing your request. Please try again.</div>';
    } finally {
        processingElement.style.display = 'none';
    }
}

// Clear results when input changes
document.getElementById('urlInput').addEventListener('input', function() {
    document.getElementById('results').innerHTML = '';
    document.getElementById('actionButtons').style.display = 'none';
});

