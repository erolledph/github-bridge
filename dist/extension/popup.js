// GitHub Bridge Extension - Popup Script

class ExtensionApp {
  constructor() {
    this.currentScreen = 'loading';
    this.githubToken = null;
    this.selectedRepository = null;
    this.uploadedFile = null;
    this.extractedFiles = [];
    
    this.init();
  }

  async init() {
    console.log('Initializing GitHub Bridge Extension');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Check for stored token
    await this.checkStoredToken();
  }

  setupEventListeners() {
    // Authentication
    document.getElementById('auth-button').addEventListener('click', () => this.authenticate());
    
    // Repository screen
    document.getElementById('repo-back-btn').addEventListener('click', () => this.showScreen('auth'));
    document.getElementById('repo-search').addEventListener('input', (e) => this.filterRepositories(e.target.value));
    document.getElementById('create-repo-btn').addEventListener('click', () => this.toggleCreateForm());
    document.getElementById('cancel-create-btn').addEventListener('click', () => this.toggleCreateForm());
    document.getElementById('confirm-create-btn').addEventListener('click', () => this.createRepository());
    
    // Upload screen
    document.getElementById('upload-back-btn').addEventListener('click', () => this.showScreen('repo'));
    document.getElementById('browse-btn').addEventListener('click', () => document.getElementById('file-input').click());
    document.getElementById('file-input').addEventListener('change', (e) => this.handleFileSelect(e));
    document.getElementById('continue-upload-btn').addEventListener('click', () => this.showScreen('commit'));
    
    // Commit screen
    document.getElementById('commit-back-btn').addEventListener('click', () => this.showScreen('upload'));
    document.getElementById('commit-message').addEventListener('input', (e) => this.updateCharCount(e.target.value));
    document.getElementById('clear-existing').addEventListener('change', (e) => this.toggleClearWarning(e.target.checked));
    document.getElementById('push-btn').addEventListener('click', () => this.pushToRepository());
    
    // Success screen
    document.getElementById('view-github-btn').addEventListener('click', () => this.viewOnGitHub());
    document.getElementById('start-over-btn').addEventListener('click', () => this.startOver());
    
    // Drop zone
    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    dropZone.addEventListener('click', () => document.getElementById('file-input').click());
  }

  async checkStoredToken() {
    try {
      const response = await this.sendMessage({ action: 'getStoredToken' });
      if (response.success && response.token) {
        this.githubToken = response.token;
        
        // Validate the stored token
        const validation = await this.sendMessage({ 
          action: 'validateToken', 
          token: this.githubToken 
        });
        
        if (validation.success && validation.validation.valid) {
          this.showScreen('repo');
          this.loadRepositories();
        } else {
          this.showScreen('auth');
        }
      } else {
        this.showScreen('auth');
      }
    } catch (error) {
      console.error('Error checking stored token:', error);
      this.showScreen('auth');
    }
  }

  async authenticate() {
    const authButton = document.getElementById('auth-button');
    const errorDiv = document.getElementById('auth-error');
    
    authButton.disabled = true;
    authButton.innerHTML = `
      <div class="spinner-small"></div>
      Signing in...
    `;
    errorDiv.classList.add('hidden');
    
    try {
      const response = await this.sendMessage({ action: 'authenticate' });
      
      if (response.success) {
        this.githubToken = response.token;
        this.showScreen('repo');
        this.loadRepositories();
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
    } finally {
      authButton.disabled = false;
      authButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        Sign in with GitHub
      `;
    }
  }

  async loadRepositories() {
    const repoList = document.getElementById('repo-list');
    repoList.innerHTML = `
      <div class="loading-repos">
        <div class="spinner"></div>
        <p>Loading repositories...</p>
      </div>
    `;
    
    try {
      const response = await this.sendMessage({ 
        action: 'getRepositories', 
        token: this.githubToken 
      });
      
      if (response.success) {
        this.repositories = response.repositories;
        this.renderRepositories(this.repositories);
      } else {
        throw new Error(response.error || 'Failed to load repositories');
      }
    } catch (error) {
      console.error('Error loading repositories:', error);
      repoList.innerHTML = `
        <div class="error-state">
          <p>Failed to load repositories: ${error.message}</p>
          <button onclick="app.loadRepositories()" class="btn-secondary">Try Again</button>
        </div>
      `;
    }
  }

  renderRepositories(repositories) {
    const repoList = document.getElementById('repo-list');
    
    if (repositories.length === 0) {
      repoList.innerHTML = `
        <div class="empty-state">
          <p>No repositories found</p>
        </div>
      `;
      return;
    }
    
    repoList.innerHTML = repositories.map(repo => `
      <div class="repo-item" data-repo-id="${repo.id}">
        <div class="repo-info">
          <div class="repo-header">
            <h3>${repo.name}</h3>
            <span class="repo-visibility">
              ${repo.private ? 
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="7" r="4"/></svg> Private' : 
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg> Public'
              }
            </span>
          </div>
          ${repo.description ? `<p class="repo-description">${repo.description}</p>` : ''}
          <small class="repo-updated">Updated ${new Date(repo.updated_at).toLocaleDateString()}</small>
        </div>
        <svg class="repo-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.repo-item').forEach(item => {
      item.addEventListener('click', () => {
        const repoId = parseInt(item.dataset.repoId);
        const repo = repositories.find(r => r.id === repoId);
        this.selectRepository(repo);
      });
    });
  }

  filterRepositories(searchTerm) {
    if (!this.repositories) return;
    
    const filtered = this.repositories.filter(repo => 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    this.renderRepositories(filtered);
  }

  toggleCreateForm() {
    const form = document.getElementById('create-repo-form');
    form.classList.toggle('hidden');
    
    if (!form.classList.contains('hidden')) {
      document.getElementById('repo-name').focus();
    } else {
      // Clear form
      document.getElementById('repo-name').value = '';
      document.getElementById('repo-description').value = '';
      document.getElementById('repo-private').checked = false;
      document.getElementById('create-error').classList.add('hidden');
    }
  }

  async createRepository() {
    const name = document.getElementById('repo-name').value.trim();
    const description = document.getElementById('repo-description').value.trim();
    const isPrivate = document.getElementById('repo-private').checked;
    const errorDiv = document.getElementById('create-error');
    const createBtn = document.getElementById('confirm-create-btn');
    
    if (!name) {
      errorDiv.textContent = 'Repository name is required';
      errorDiv.classList.remove('hidden');
      return;
    }
    
    createBtn.disabled = true;
    createBtn.innerHTML = `
      <div class="spinner-small"></div>
      Creating...
    `;
    errorDiv.classList.add('hidden');
    
    try {
      const response = await this.sendMessage({
        action: 'createRepository',
        token: this.githubToken,
        name,
        description: description || undefined,
        isPrivate
      });
      
      if (response.success) {
        this.selectRepository(response.repository);
        this.toggleCreateForm();
      } else {
        throw new Error(response.error || 'Failed to create repository');
      }
    } catch (error) {
      console.error('Error creating repository:', error);
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
    } finally {
      createBtn.disabled = false;
      createBtn.innerHTML = 'Create Repository';
    }
  }

  selectRepository(repository) {
    this.selectedRepository = repository;
    this.showScreen('upload');
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('drop-zone').classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('drop-zone').classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('drop-zone').classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  async processFile(file) {
    if (!file.name.endsWith('.zip')) {
      this.showError('upload-error', 'Please upload a ZIP file');
      return;
    }
    
    const dropZone = document.getElementById('drop-zone');
    dropZone.innerHTML = `
      <div class="processing">
        <div class="spinner"></div>
        <p>Processing ZIP file...</p>
      </div>
    `;
    
    try {
      // Load JSZip library dynamically
      if (typeof JSZip === 'undefined') {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      }
      
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      const extractedFiles = [];
      const allPaths = Object.keys(zipContent.files).filter(path => !zipContent.files[path].dir);
      
      // Find common root folder
      let commonRoot = '';
      if (allPaths.length > 0) {
        const firstPath = allPaths[0];
        const pathParts = firstPath.split('/');
        
        if (pathParts.length > 1) {
          const potentialRoot = pathParts[0] + '/';
          const allHaveSameRoot = allPaths.every(path => path.startsWith(potentialRoot));
          
          if (allHaveSameRoot) {
            commonRoot = potentialRoot;
          }
        }
      }
      
      // Process each file
      for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
        if (!zipEntry.dir) {
          let finalPath = relativePath;
          if (commonRoot && relativePath.startsWith(commonRoot)) {
            finalPath = relativePath.substring(commonRoot.length);
          }
          
          if (!finalPath) continue;
          
          try {
            const content = await zipEntry.async('string');
            extractedFiles.push({
              path: finalPath,
              content: content,
              isDirectory: false
            });
          } catch {
            const content = await zipEntry.async('uint8array');
            extractedFiles.push({
              path: finalPath,
              content: content,
              isDirectory: false
            });
          }
        }
      }
      
      this.uploadedFile = {
        name: file.name,
        size: file.size,
        extractedFiles: extractedFiles
      };
      
      this.showFilePreview();
      
    } catch (error) {
      console.error('Error processing file:', error);
      this.showError('upload-error', 'Failed to process ZIP file. Please ensure it\'s a valid ZIP archive.');
      this.resetDropZone();
    }
  }

  showFilePreview() {
    const preview = document.getElementById('file-preview');
    const fileInfo = document.getElementById('file-info');
    const fileList = document.getElementById('file-list');
    
    fileInfo.innerHTML = `
      <div class="file-details">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <div>
          <h4>${this.uploadedFile.name}</h4>
          <p>${(this.uploadedFile.size / 1024 / 1024).toFixed(2)} MB • ${this.uploadedFile.extractedFiles.length} files</p>
        </div>
      </div>
    `;
    
    const filesToShow = this.uploadedFile.extractedFiles.slice(0, 10);
    fileList.innerHTML = `
      <div class="file-items">
        ${filesToShow.map(file => `
          <div class="file-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <span>${file.path}</span>
          </div>
        `).join('')}
        ${this.uploadedFile.extractedFiles.length > 10 ? 
          `<p class="more-files">... and ${this.uploadedFile.extractedFiles.length - 10} more files</p>` : 
          ''
        }
      </div>
    `;
    
    document.getElementById('drop-zone').classList.add('hidden');
    preview.classList.remove('hidden');
  }

  resetDropZone() {
    const dropZone = document.getElementById('drop-zone');
    dropZone.classList.remove('hidden');
    dropZone.innerHTML = `
      <div class="drop-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <h3>Drop your ZIP file here</h3>
        <p>or <button id="browse-btn" class="link-btn">click to browse</button></p>
        <small>Supports ZIP files exported from Bolt.new</small>
      </div>
    `;
    
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('browse-btn').addEventListener('click', () => document.getElementById('file-input').click());
  }

  async showCommitScreen() {
    // Set up repository info
    const repoInfo = document.getElementById('repo-info');
    repoInfo.innerHTML = `
      <div class="selected-repo">
        <img src="${this.selectedRepository.owner.avatar_url}" alt="${this.selectedRepository.owner.login}" class="repo-avatar">
        <div>
          <h3>${this.selectedRepository.full_name}</h3>
          <p>${this.uploadedFile.extractedFiles.length} files to upload</p>
        </div>
      </div>
    `;
    
    // Set default commit message
    const commitMessage = document.getElementById('commit-message');
    commitMessage.value = `Upload project from Bolt.new: ${this.uploadedFile.name.replace('.zip', '')}`;
    this.updateCharCount(commitMessage.value);
    
    // Load branches
    await this.loadBranches();
  }

  async loadBranches() {
    const branchSelect = document.getElementById('branch-select');
    branchSelect.innerHTML = '<option value="">Loading branches...</option>';
    
    try {
      const response = await this.sendMessage({
        action: 'getBranches',
        token: this.githubToken,
        owner: this.selectedRepository.owner.login,
        repo: this.selectedRepository.name
      });
      
      if (response.success) {
        const branches = response.branches;
        branchSelect.innerHTML = branches.map(branch => 
          `<option value="${branch}" ${branch === this.selectedRepository.default_branch ? 'selected' : ''}>${branch}</option>`
        ).join('');
      } else {
        branchSelect.innerHTML = `<option value="${this.selectedRepository.default_branch}">${this.selectedRepository.default_branch}</option>`;
      }
    } catch (error) {
      console.error('Error loading branches:', error);
      branchSelect.innerHTML = `<option value="${this.selectedRepository.default_branch}">${this.selectedRepository.default_branch}</option>`;
    }
  }

  updateCharCount(message) {
    const charCount = document.querySelector('.char-count');
    charCount.textContent = `${message.length}/72 characters (recommended)`;
    charCount.className = `char-count ${message.length > 72 ? 'over-limit' : ''}`;
  }

  toggleClearWarning(show) {
    const warning = document.getElementById('clear-warning');
    warning.classList.toggle('hidden', !show);
  }

  async pushToRepository() {
    const commitMessage = document.getElementById('commit-message').value.trim();
    const selectedBranch = document.getElementById('branch-select').value;
    const clearExisting = document.getElementById('clear-existing').checked;
    const pushBtn = document.getElementById('push-btn');
    const errorDiv = document.getElementById('commit-error');
    
    if (!commitMessage) {
      this.showError('commit-error', 'Please enter a commit message');
      return;
    }
    
    pushBtn.disabled = true;
    errorDiv.classList.add('hidden');
    
    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    
    progressDiv.classList.remove('hidden');
    
    try {
      const response = await this.sendMessage({
        action: 'uploadFiles',
        token: this.githubToken,
        repository: this.selectedRepository,
        files: this.uploadedFile.extractedFiles,
        commitInfo: {
          message: commitMessage,
          branch: selectedBranch,
          clearExisting: clearExisting
        }
      });
      
      if (response.success) {
        this.showScreen('success');
      } else {
        throw new Error(response.error || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      this.showError('commit-error', error.message);
      progressDiv.classList.add('hidden');
    } finally {
      pushBtn.disabled = false;
    }
  }

  viewOnGitHub() {
    const branch = document.getElementById('branch-select').value;
    const url = `${this.selectedRepository.html_url}/tree/${branch}`;
    chrome.tabs.create({ url });
  }

  startOver() {
    this.selectedRepository = null;
    this.uploadedFile = null;
    this.extractedFiles = [];
    this.showScreen('repo');
  }

  showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    // Show target screen
    document.getElementById(`${screenName}-screen`).classList.remove('hidden');
    this.currentScreen = screenName;
    
    // Special handling for certain screens
    if (screenName === 'commit') {
      this.showCommitScreen();
    } else if (screenName === 'success') {
      const successMessage = document.getElementById('success-message');
      successMessage.textContent = `Your project has been successfully uploaded to ${this.selectedRepository.full_name}`;
    }
  }

  showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }

  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Listen for progress updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'uploadProgress') {
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    
    if (progressFill && progressPercent) {
      progressFill.style.width = `${message.progress}%`;
      progressPercent.textContent = `${message.progress}%`;
    }
  }
});

// Initialize the app
const app = new ExtensionApp();