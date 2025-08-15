// GitHub Bridge Extension - Background Script
class BackgroundService {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('GitHub Bridge extension installed');
                this.openWelcomePage();
            }
        });

        // Handle messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Handle storage changes
        chrome.storage.onChanged.addListener((changes, namespace) => {
            this.handleStorageChange(changes, namespace);
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'validateToken':
                    const validation = await this.validateGitHubToken(request.token);
                    sendResponse({ success: true, data: validation });
                    break;

                case 'fetchRepositories':
                    const repositories = await this.fetchRepositories(request.token);
                    sendResponse({ success: true, data: repositories });
                    break;

                case 'createRepository':
                    const newRepo = await this.createRepository(request.token, request.repoData);
                    sendResponse({ success: true, data: newRepo });
                    break;

                case 'uploadFiles':
                    const uploadResult = await this.uploadFiles(request.token, request.uploadData);
                    sendResponse({ success: true, data: uploadResult });
                    break;

                case 'openTab':
                    await this.openTab(request.url);
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async validateGitHubToken(token) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const user = await response.json();
                
                // Check token scopes
                const scopes = response.headers.get('x-oauth-scopes');
                const scopeList = scopes ? scopes.split(', ').map(s => s.trim()) : [];
                
                return {
                    valid: true,
                    user: user,
                    scopes: scopeList,
                    hasRequiredScopes: scopeList.includes('repo') && scopeList.includes('user:email')
                };
            } else {
                return { valid: false, error: 'Invalid token' };
            }
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    async fetchRepositories(token) {
        try {
            const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch repositories');
            }
        } catch (error) {
            throw new Error(`Repository fetch failed: ${error.message}`);
        }
    }

    async createRepository(token, repoData) {
        try {
            const response = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: repoData.name,
                    description: repoData.description,
                    private: repoData.private,
                    auto_init: true
                })
            });

            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create repository');
            }
        } catch (error) {
            throw new Error(`Repository creation failed: ${error.message}`);
        }
    }

    async uploadFiles(token, uploadData) {
        try {
            const { repository, files, commitMessage, branch, clearExisting } = uploadData;
            const owner = repository.owner.login;
            const repo = repository.name;

            // Get current commit SHA
            let currentCommitSha;
            try {
                const branchResponse = await fetch(
                    `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`,
                    {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (branchResponse.ok) {
                    const branchData = await branchResponse.json();
                    currentCommitSha = branchData.commit.sha;
                } else {
                    // Branch doesn't exist, create from default branch
                    const defaultBranchResponse = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/branches/${repository.default_branch}`,
                        {
                            headers: {
                                'Authorization': `token ${token}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        }
                    );
                    const defaultBranchData = await defaultBranchResponse.json();
                    currentCommitSha = defaultBranchData.commit.sha;
                }
            } catch (error) {
                throw new Error('Failed to get current commit SHA');
            }

            // Get current tree
            const currentCommitResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/commits/${currentCommitSha}`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            const currentCommit = await currentCommitResponse.json();

            // Create tree entries
            const treeEntries = files
                .filter(file => !file.isDirectory)
                .map(file => ({
                    path: file.path,
                    mode: '100644',
                    type: 'blob',
                    ...(typeof file.content === 'string' 
                        ? { content: file.content }
                        : { 
                            content: this.arrayBufferToBase64(file.content),
                            encoding: 'base64'
                        }
                    ),
                }));

            // Create new tree
            const treeResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/trees`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tree: treeEntries,
                        base_tree: clearExisting ? undefined : currentCommit.tree.sha
                    })
                }
            );

            if (!treeResponse.ok) {
                const error = await treeResponse.json();
                throw new Error(error.message || 'Failed to create tree');
            }

            const newTree = await treeResponse.json();

            // Create new commit
            const commitResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/commits`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: commitMessage,
                        tree: newTree.sha,
                        parents: [currentCommitSha]
                    })
                }
            );

            if (!commitResponse.ok) {
                const error = await commitResponse.json();
                throw new Error(error.message || 'Failed to create commit');
            }

            const newCommit = await commitResponse.json();

            // Update branch reference
            const refResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sha: newCommit.sha
                    })
                }
            );

            if (!refResponse.ok) {
                const error = await refResponse.json();
                throw new Error(error.message || 'Failed to update branch reference');
            }

            return {
                commitSha: newCommit.sha,
                commitUrl: newCommit.html_url,
                repositoryUrl: `${repository.html_url}/tree/${branch}`
            };
        } catch (error) {
            throw new Error(`File upload failed: ${error.message}`);
        }
    }

    async openTab(url) {
        try {
            await chrome.tabs.create({ url });
        } catch (error) {
            throw new Error(`Failed to open tab: ${error.message}`);
        }
    }

    openWelcomePage() {
        // Open the extension popup or a welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('popup.html')
        });
    }

    handleStorageChange(changes, namespace) {
        // Handle storage changes if needed
        console.log('Storage changed:', changes, namespace);
    }

    // Utility Methods
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // GitHub API Rate Limiting
    async checkRateLimit(token) {
        try {
            const response = await fetch('https://api.github.com/rate_limit', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to check rate limit:', error);
        }
        return null;
    }

    // Error Handling
    handleApiError(response, defaultMessage) {
        if (response.status === 401) {
            return 'Authentication failed. Please check your GitHub token.';
        } else if (response.status === 403) {
            return 'Access forbidden. Please check your token permissions.';
        } else if (response.status === 404) {
            return 'Resource not found.';
        } else if (response.status === 422) {
            return 'Invalid request data.';
        } else if (response.status >= 500) {
            return 'GitHub server error. Please try again later.';
        }
        return defaultMessage;
    }
}

// Initialize background service
const backgroundService = new BackgroundService();

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
    console.log('GitHub Bridge extension started');
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener((details) => {
    console.log('Extension update available:', details);
});