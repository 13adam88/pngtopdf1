// Navigation System
class NavigationManager {
  constructor() {
    this.currentPage = 'home';
    this.initializeNavigation();
  }

  initializeNavigation() {
    // Handle nav link clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        this.showPage(pageId);
      });
    });

    // Handle mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });
    }

    // Handle contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
    }
  }

  showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageId;
    }

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-page') === pageId) {
        link.classList.add('active');
      }
    });

    // Close mobile menu if open
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.getElementById('navToggle');
    if (navMenu && navToggle) {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    // Simulate form submission (replace with actual form handling)
    alert('Thank you for contacting us! We will reply to you as soon as possible.');
    
    // Reset form
    e.target.reset();
  }
}

// PNG to PDF Converter using jsPDF from CDN
class PNGToPDFConverter {
  constructor() {
    this.selectedFiles = [];
    this.generatedPDF = null;
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.dropZone = document.getElementById('dropZone');
    this.fileInput = document.getElementById('fileInput');
    this.browseBtn = document.getElementById('browseBtn');
    this.filesSection = document.getElementById('filesSection');
    this.filesList = document.getElementById('filesList');
    this.convertBtn = document.getElementById('convertBtn');
    this.loadingSection = document.getElementById('loadingSection');
    this.successSection = document.getElementById('successSection');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.pageSize = document.getElementById('pageSize');
    this.orientation = document.getElementById('orientation');
    this.imageSize = document.getElementById('imageSize');
  }

  attachEventListeners() {
    // File input events
    this.browseBtn.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    // Drag and drop events
    this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    this.dropZone.addEventListener('dragenter', () => this.dropZone.classList.add('drag-over'));
    this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('drag-over'));
    this.dropZone.addEventListener('click', () => this.fileInput.click());

    // Button events
    this.convertBtn.addEventListener('click', () => this.convertToPDF());
    this.downloadBtn.addEventListener('click', () => this.downloadPDF());
    this.resetBtn.addEventListener('click', () => this.resetConverter());
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  handleDrop(e) {
    e.preventDefault();
    this.dropZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'image/png');
    this.addFiles(files);
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files).filter(file => file.type === 'image/png');
    this.addFiles(files);
  }

  addFiles(files) {
    if (files.length === 0) {
      alert('Please select only PNG files.');
      return;
    }

    this.selectedFiles = [...this.selectedFiles, ...files];
    this.renderFilesList();
    this.showFilesSection();
  }

  renderFilesList() {
    this.filesList.innerHTML = '';
    
    this.selectedFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      
      fileItem.innerHTML = `
        <div class="file-info">
          <div class="file-icon">PNG</div>
          <div class="file-details">
            <h4>${file.name}</h4>
            <p>${this.formatFileSize(file.size)}</p>
          </div>
        </div>
        <button class="remove-btn" onclick="converter.removeFile(${index})">Remove</button>
      `;
      
      this.filesList.appendChild(fileItem);
    });
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    this.renderFilesList();
    
    if (this.selectedFiles.length === 0) {
      this.hideFilesSection();
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showFilesSection() {
    this.filesSection.style.display = 'block';
  }

  hideFilesSection() {
    this.filesSection.style.display = 'none';
  }

  showLoadingSection() {
    this.filesSection.style.display = 'none';
    this.loadingSection.style.display = 'block';
  }

  showSuccessSection() {
    this.loadingSection.style.display = 'none';
    this.successSection.style.display = 'block';
  }

  async convertToPDF() {
    if (this.selectedFiles.length === 0) {
      alert('Please select at least one PNG file.');
      return;
    }

    this.showLoadingSection();

    try {
      // Check for jsPDF from CDN - multiple possible access patterns
      let jsPDFConstructor;
      
      if (window.jspdf && window.jspdf.jsPDF) {
        jsPDFConstructor = window.jspdf.jsPDF;
      } else if (window.jsPDF && window.jsPDF.jsPDF) {
        jsPDFConstructor = window.jsPDF.jsPDF;
      } else if (window.jsPDF) {
        jsPDFConstructor = window.jsPDF;
      } else {
        throw new Error('jsPDF library not found');
      }

      const pdf = new jsPDFConstructor({
        orientation: this.orientation.value,
        unit: 'mm',
        format: this.pageSize.value
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        
        if (i > 0) {
          pdf.addPage();
        }

        const imageData = await this.fileToBase64(file);
        const img = await this.loadImage(imageData);
        
        const { width, height, x, y } = this.calculateImageDimensions(
          img.width, 
          img.height, 
          pageWidth, 
          pageHeight
        );

        pdf.addImage(imageData, 'PNG', x, y, width, height);
      }

      this.generatedPDF = pdf;
      this.showSuccessSection();
    } catch (error) {
      console.error('Error converting to PDF:', error);
      alert('An error occurred while converting to PDF. Please try again.');
      this.hideLoadingSection();
      this.showFilesSection();
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  calculateImageDimensions(imgWidth, imgHeight, pageWidth, pageHeight) {
    const imageFit = this.imageSize.value;
    const margin = 10; // 10mm margin
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    let width, height, x, y;

    switch (imageFit) {
      case 'fit':
        const scaleX = availableWidth / imgWidth;
        const scaleY = availableHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        
        width = imgWidth * scale;
        height = imgHeight * scale;
        x = (pageWidth - width) / 2;
        y = (pageHeight - height) / 2;
        break;

      case 'fill':
        width = availableWidth;
        height = availableHeight;
        x = margin;
        y = margin;
        break;

      case 'original':
        // Convert pixels to mm (assuming 72 DPI)
        const pixelToMm = 0.352778;
        width = Math.min(imgWidth * pixelToMm, availableWidth);
        height = Math.min(imgHeight * pixelToMm, availableHeight);
        x = (pageWidth - width) / 2;
        y = (pageHeight - height) / 2;
        break;

      default:
        width = availableWidth;
        height = availableHeight;
        x = margin;
        y = margin;
    }

    return { width, height, x, y };
  }

  downloadPDF() {
    if (this.generatedPDF) {
      const filename = this.selectedFiles.length === 1 
        ? this.selectedFiles[0].name.replace('.png', '.pdf')
        : 'converted-images.pdf';
      
      this.generatedPDF.save(filename);
    }
  }

  resetConverter() {
    this.selectedFiles = [];
    this.generatedPDF = null;
    this.fileInput.value = '';
    
    this.successSection.style.display = 'none';
    this.loadingSection.style.display = 'none';
    this.hideFilesSection();
    this.dropZone.classList.remove('drag-over');
  }

  hideLoadingSection() {
    this.loadingSection.style.display = 'none';
  }
}

// Global function for showPage (needed for onclick handlers)
function showPage(pageId) {
  if (window.navigationManager) {
    window.navigationManager.showPage(pageId);
  }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation first
  window.navigationManager = new NavigationManager();
  
  // Wait a moment for jsPDF to load from CDN
  setTimeout(() => {
    // Check for jsPDF availability with multiple possible access patterns
    if (window.jspdf || window.jsPDF) {
      console.log('jsPDF library loaded successfully');
      window.converter = new PNGToPDFConverter();
    } else {
      console.error('jsPDF library not loaded. Please check your internet connection and try refreshing the page.');
      alert('Required library not loaded. Please check your internet connection and refresh the page.');
    }
  }, 100);
});
