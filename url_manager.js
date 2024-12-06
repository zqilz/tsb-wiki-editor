// url_manager.js
class URLManager {
  constructor() {
    this.modalOverlay = document.getElementById('modalOverlay');
    this.urlInput = document.getElementById('urlInput');
    this.urlInputField = document.createElement('input');
    this.urlInputField.id = 'url-input-field';
    this.urlInputField.type = 'text';
    this.urlInputField.placeholder = 'Enter URL';
    this.urlInput.insertBefore(this.urlInputField, this.urlInput.firstChild);
    
    this.currentAction = null;
    this.selectedRange = null;
    this.allowedDomains = [
      /^(?:www\.)?youtube\.com$/,
      /^youtu\.be$/,
      /^(?:www\.)?instagram\.com$/,
      /^(?:www\.)?tiktok\.com$/,
      /^(?:www\.)?discord\.com$/,
      /^(?:www\.)?roblox\.com$/
    ];

    // Bind methods
    this.handleURLConfirm = this.handleURLConfirm.bind(this);
    
    // Set up event listeners
    const confirmButton = this.urlInput.querySelector('.url-input-buttons').firstElementChild;
    const cancelButton = this.urlInput.querySelector('.url-input-buttons').lastElementChild;
    
    confirmButton.addEventListener('click', this.handleURLConfirm);
    cancelButton.addEventListener('click', () => this.hideURLPrompt());
    
    // Handle modal overlay clicks
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.hideURLPrompt();
      }
    });
  }

  showURLPrompt(action) {
    // Store the current selection before showing the prompt
    if (action === 'link') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        this.selectedRange = selection.getRangeAt(0).cloneRange();
      }
    }
    
    this.currentAction = action;
    this.modalOverlay.style.display = 'block';
    this.urlInput.style.display = 'block';
    this.urlInputField.value = '';
    this.urlInputField.focus();
  }

  hideURLPrompt() {
    this.modalOverlay.style.display = 'none';
    this.urlInput.style.display = 'none';
    this.urlInputField.value = '';
    this.currentAction = null;
    this.selectedRange = null;
  }

  validateURL(url) {
    try {
      const urlObj = new URL(url);
      return this.allowedDomains.some(pattern => pattern.test(urlObj.hostname));
    } catch {
      return false;
    }
  }

  getYouTubeID(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      return urlObj.searchParams.get('v');
    } catch {
      return null;
    }
  }

  createVideoEmbed(url) {
    try {
      const urlObj = new URL(url);
      const iframe = document.createElement('iframe');
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.width = '100%';
      iframe.style.height = '315px';
      iframe.style.border = 'none';

      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be') {
        const videoId = this.getYouTubeID(url);
        if (!videoId) return null;
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        return iframe;
      }
      
      if (urlObj.hostname.includes('instagram.com')) {
        const postId = url.split('/p/')[1]?.split('/')[0];
        if (!postId) return null;
        iframe.src = `https://www.instagram.com/p/${postId}/embed`;
        return iframe;
      }

      // For other platforms, create a link
      const link = document.createElement('a');
      link.href = url;
      link.textContent = `View content on ${urlObj.hostname}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      return link;
    } catch {
      return null;
    }
  }

  handleURLConfirm() {
    const url = this.urlInputField.value.trim();
    
    if (!url) {
      alert('Please enter a URL');
      return false;
    }

    if (!this.validateURL(url)) {
      alert('Invalid URL. Only YouTube, Roblox, Instagram, TikTok and Discord URLs are allowed.');
      return false;
    }

    if (this.currentAction === 'video') {
      const embed = this.createVideoEmbed(url);
      if (!embed) {
        alert('Unable to create embed for this URL');
        return false;
      }
      
      const container = document.getElementById('video-container');
      container.innerHTML = '';
      container.appendChild(embed);
    } else if (this.currentAction === 'link' && this.selectedRange) {
      const link = document.createElement('a');
      link.href = url;
      link.textContent = this.selectedRange.toString() || url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Restore the selection and insert the link
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.selectedRange);
      
      this.selectedRange.deleteContents();
      this.selectedRange.insertNode(link);
    }

    this.hideURLPrompt();
    return true;
  }
}

export const urlManager = new URLManager();
