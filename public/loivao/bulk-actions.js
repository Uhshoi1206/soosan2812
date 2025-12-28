/**
 * Bulk Actions Tool for Soosan Motor CMS
 * Provides functionality to bulk hide/show products and blog posts
 */

// Configuration
const CONFIG = {
    repo: 'Uhshoi1206/soosan2812',
    branch: 'main',
    paths: {
        products: {
            'xe-tai': 'src/content/products/xe-tai',
            'xe-cau': 'src/content/products/xe-cau',
            'mooc': 'src/content/products/mooc',
            'dau-keo': 'src/content/products/dau-keo',
            'xe-lu': 'src/content/products/xe-lu',
            'may-moc-thiet-bi': 'src/content/products/may-moc-thiet-bi'
        },
        blog: {
            'tin-tuc-nganh-van-tai': 'src/content/blog/tin-tuc-nganh-van-tai',
            'danh-gia-xe': 'src/content/blog/danh-gia-xe',
            'kinh-nghiem-lai-xe': 'src/content/blog/kinh-nghiem-lai-xe',
            'bao-duong': 'src/content/blog/bao-duong',
            'tu-van-mua-xe': 'src/content/blog/tu-van-mua-xe',
            'cong-nghe-va-doi-moi': 'src/content/blog/cong-nghe-va-doi-moi'
        }
    },
    categoryLabels: {
        products: {
            'xe-tai': '🚚 Xe Tải',
            'xe-cau': '🏗️ Xe Cẩu',
            'mooc': '🚛 Sơ Mi Rơ Mooc',
            'dau-keo': '🚛 Xe Đầu Kéo',
            'xe-lu': '🚜 Xe Lu',
            'may-moc-thiet-bi': '⚙️ Máy Móc & Thiết Bị'
        },
        blog: {
            'tin-tuc-nganh-van-tai': '📰 Tin Tức Ngành Vận Tải',
            'danh-gia-xe': '⭐ Đánh Giá Xe',
            'kinh-nghiem-lai-xe': '🚗 Kinh Nghiệm Lái Xe',
            'bao-duong': '🔧 Bảo Dưỡng',
            'tu-van-mua-xe': '💡 Tư Vấn Mua Xe',
            'cong-nghe-va-doi-moi': '🔬 Công Nghệ & Đổi Mới'
        }
    }
};

// State
let currentTab = 'products';
let allItems = [];
let filteredItems = [];
let selectedItems = new Set();
let isOperationRunning = false;

// =====================================================
// LOGGING & UI UTILITIES
// =====================================================

function log(message, type = 'info') {
    const logContainer = document.getElementById('status-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString('vi-VN')}] ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function clearLog() {
    document.getElementById('status-log').innerHTML = '';
}

function showLoading(show = true) {
    document.getElementById('loading-overlay').classList.toggle('active', show);
}

function showProgress(show = true) {
    document.getElementById('progress-bar').classList.toggle('active', show);
}

function setProgress(percent) {
    document.getElementById('progress-fill').style.width = `${percent}%`;
}

function updateSelectionInfo() {
    document.getElementById('selected-count').textContent = selectedItems.size;
    document.getElementById('total-count').textContent = filteredItems.length;

    const btnHide = document.getElementById('btn-hide');
    const btnShow = document.getElementById('btn-show');

    btnHide.disabled = selectedItems.size === 0 || isOperationRunning;
    btnShow.disabled = selectedItems.size === 0 || isOperationRunning;
}

// =====================================================
// GITHUB TOKEN HANDLING
// =====================================================

function getGitHubToken() {
    // Try Sveltia CMS token storage
    const sveltiaAuth = localStorage.getItem('sveltia-cms.auth');
    if (sveltiaAuth) {
        try {
            const auth = JSON.parse(sveltiaAuth);
            if (auth.token) return auth.token;
        } catch (e) { }
    }

    // Try Netlify CMS token storage
    const netlifyAuth = localStorage.getItem('netlify-cms-user');
    if (netlifyAuth) {
        try {
            const auth = JSON.parse(netlifyAuth);
            if (auth.token) return auth.token;
        } catch (e) { }
    }

    // Try direct token
    const directToken = localStorage.getItem('github-token');
    if (directToken) return directToken;

    // Check for manually saved token
    const manualToken = localStorage.getItem('backup-github-token');
    if (manualToken) return manualToken;

    // Search ALL localStorage keys for anything containing token data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        if (!value) continue;

        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object' && parsed !== null) {
                const tokenFields = ['token', 'access_token', 'backendToken', 'github_token', 'accessToken'];
                for (const field of tokenFields) {
                    if (parsed[field] && typeof parsed[field] === 'string' && parsed[field].length > 20) {
                        return parsed[field];
                    }
                }
                for (const subKey of ['user', 'auth', 'data']) {
                    if (parsed[subKey] && typeof parsed[subKey] === 'object') {
                        for (const field of tokenFields) {
                            if (parsed[subKey][field] && typeof parsed[subKey][field] === 'string') {
                                return parsed[subKey][field];
                            }
                        }
                    }
                }
            }
        } catch (e) {
            if (value.startsWith('ghp_') || value.startsWith('gho_') || value.startsWith('github_pat_')) {
                return value;
            }
        }
    }

    return null;
}

function promptForToken() {
    const token = prompt(
        'Không tìm thấy GitHub token tự động.\n\n' +
        'Để sử dụng chức năng này, bạn cần nhập Personal Access Token (PAT) của GitHub.\n\n' +
        'Cách lấy token:\n' +
        '1. Truy cập: github.com/settings/tokens\n' +
        '2. Chọn "Generate new token (classic)"\n' +
        '3. Đặt tên, chọn quyền "repo" (full control)\n' +
        '4. Copy token và paste vào đây\n\n' +
        'Nhập GitHub Token:'
    );

    if (token && token.trim()) {
        localStorage.setItem('backup-github-token', token.trim());
        return token.trim();
    }
    return null;
}

// =====================================================
// GITHUB API FUNCTIONS
// =====================================================

async function fetchDirectoryContents(path, token) {
    const url = `https://api.github.com/repos/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            return []; // Directory doesn't exist
        }
        throw new Error(`Failed to fetch ${path}: ${response.status}`);
    }

    return await response.json();
}

async function fetchFileContent(path, token) {
    const url = `https://api.github.com/repos/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status}`);
    }

    const data = await response.json();

    if (data.content) {
        // Decode base64
        const cleanBase64 = data.content.replace(/\n/g, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const content = new TextDecoder('utf-8').decode(bytes);

        return {
            content,
            sha: data.sha,
            path: data.path
        };
    }

    throw new Error('No content in response');
}

async function updateFile(path, content, sha, token, message) {
    const url = `https://api.github.com/repos/${CONFIG.repo}/contents/${path}`;

    // Encode content to base64
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            content: base64Content,
            sha: sha,
            branch: CONFIG.branch
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
}

// =====================================================
// DATA LOADING
// =====================================================

async function loadData() {
    showLoading(true);
    clearLog();
    log('Đang tải dữ liệu...', 'info');

    try {
        let token = getGitHubToken();
        if (!token) {
            log('⚠ Không tìm thấy token tự động', 'warning');
            token = promptForToken();
            if (!token) {
                throw new Error('Không có GitHub token');
            }
        }

        allItems = [];
        const paths = CONFIG.paths[currentTab];
        const labels = CONFIG.categoryLabels[currentTab];

        for (const [category, path] of Object.entries(paths)) {
            try {
                log(`Đang quét ${labels[category]}...`, 'info');
                const files = await fetchDirectoryContents(path, token);

                for (const file of files) {
                    if (file.type === 'file' && (file.name.endsWith('.json') || file.name.endsWith('.md'))) {
                        try {
                            const fileData = await fetchFileContent(file.path, token);
                            let itemData;

                            if (file.name.endsWith('.json')) {
                                itemData = JSON.parse(fileData.content);
                            } else if (file.name.endsWith('.md')) {
                                // Parse frontmatter from markdown
                                const match = fileData.content.match(/^---\n([\s\S]*?)\n---/);
                                if (match) {
                                    itemData = parseYAMLFrontmatter(match[1]);
                                }
                            }

                            if (itemData) {
                                allItems.push({
                                    id: itemData.id || file.name.replace(/\.(json|md)$/, ''),
                                    name: itemData.name || itemData.title || 'Không có tên',
                                    brand: itemData.brand || '',
                                    category: category,
                                    categoryLabel: labels[category],
                                    isHidden: itemData.isHidden === true,
                                    path: file.path,
                                    sha: fileData.sha,
                                    content: fileData.content,
                                    isMarkdown: file.name.endsWith('.md')
                                });
                            }
                        } catch (e) {
                            log(`⚠ Lỗi đọc ${file.name}: ${e.message}`, 'warning');
                        }
                    }
                }

                log(`✓ ${labels[category]}: ${files.filter(f => f.type === 'file').length} items`, 'success');

            } catch (e) {
                log(`⚠ Không thể đọc ${category}: ${e.message}`, 'warning');
            }
        }

        log(`✓ Tổng cộng: ${allItems.length} items`, 'success');
        updateCategoryFilter();
        applyFilters();

    } catch (error) {
        log(`✗ Lỗi: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function parseYAMLFrontmatter(yaml) {
    const result = {};
    const lines = yaml.split('\n');

    for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
            let value = match[2].trim();
            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            // Parse boolean
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            // Parse number
            if (/^\d+$/.test(value)) value = parseInt(value);

            result[match[1]] = value;
        }
    }

    return result;
}

// =====================================================
// FILTERING & DISPLAY
// =====================================================

function updateCategoryFilter() {
    const select = document.getElementById('filter-category');
    const labels = CONFIG.categoryLabels[currentTab];

    select.innerHTML = '<option value="">Tất cả danh mục</option>';

    for (const [key, label] of Object.entries(labels)) {
        const count = allItems.filter(i => i.category === key).length;
        if (count > 0) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${label} (${count})`;
            select.appendChild(option);
        }
    }
}

function applyFilters() {
    const category = document.getElementById('filter-category').value;
    const status = document.getElementById('filter-status').value;
    const search = document.getElementById('filter-search').value.toLowerCase();

    filteredItems = allItems.filter(item => {
        if (category && item.category !== category) return false;
        if (status === 'visible' && item.isHidden) return false;
        if (status === 'hidden' && !item.isHidden) return false;
        if (search && !item.name.toLowerCase().includes(search)) return false;
        return true;
    });

    // Clear selection when filters change
    selectedItems.clear();
    document.getElementById('select-all').checked = false;

    renderItems();
    updateSelectionInfo();
}

function renderItems() {
    const tbody = document.getElementById('items-tbody');
    const emptyState = document.getElementById('empty-state');

    if (filteredItems.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = filteredItems.map(item => `
        <tr data-id="${item.id}">
            <td>
                <input type="checkbox" 
                    ${selectedItems.has(item.id) ? 'checked' : ''} 
                    onchange="toggleItemSelection('${item.id}')">
            </td>
            <td>
                <div class="item-name">${escapeHtml(item.name)}</div>
                ${item.brand ? `<div class="item-brand">${escapeHtml(item.brand)}</div>` : ''}
            </td>
            <td>${item.categoryLabel}</td>
            <td>
                <span class="status-badge ${item.isHidden ? 'hidden' : 'visible'}">
                    ${item.isHidden ? '🙈 Đang ẩn' : '👁️ Đang hiện'}
                </span>
            </td>
        </tr>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =====================================================
// SELECTION HANDLING
// =====================================================

function toggleSelectAll() {
    const selectAll = document.getElementById('select-all');

    if (selectAll.checked) {
        filteredItems.forEach(item => selectedItems.add(item.id));
    } else {
        selectedItems.clear();
    }

    renderItems();
    updateSelectionInfo();
}

function toggleItemSelection(id) {
    if (selectedItems.has(id)) {
        selectedItems.delete(id);
    } else {
        selectedItems.add(id);
    }

    // Update select-all checkbox
    const selectAll = document.getElementById('select-all');
    selectAll.checked = selectedItems.size === filteredItems.length && filteredItems.length > 0;

    updateSelectionInfo();
}

// =====================================================
// BULK ACTIONS
// =====================================================

async function bulkHide() {
    await bulkUpdateVisibility(true);
}

async function bulkShow() {
    await bulkUpdateVisibility(false);
}

async function bulkUpdateVisibility(hide) {
    if (selectedItems.size === 0) {
        log('Vui lòng chọn ít nhất một mục', 'warning');
        return;
    }

    const action = hide ? 'Ẩn' : 'Hiện';
    if (!confirm(`Bạn có chắc muốn ${action.toLowerCase()} ${selectedItems.size} mục đã chọn?`)) {
        return;
    }

    isOperationRunning = true;
    updateSelectionInfo();
    clearLog();
    showProgress(true);

    try {
        let token = getGitHubToken();
        if (!token) {
            token = promptForToken();
            if (!token) {
                throw new Error('Không có GitHub token');
            }
        }

        log(`Bắt đầu ${action.toLowerCase()} ${selectedItems.size} mục...`, 'info');

        const itemsToUpdate = allItems.filter(item => selectedItems.has(item.id));
        let success = 0;
        let failed = 0;

        for (let i = 0; i < itemsToUpdate.length; i++) {
            const item = itemsToUpdate[i];

            try {
                let newContent;
                const commitMessage = `[Bulk ${action}] ${item.name}`;

                if (item.isMarkdown) {
                    // Update markdown frontmatter
                    newContent = updateMarkdownFrontmatter(item.content, 'isHidden', hide);
                } else {
                    // Update JSON
                    const jsonData = JSON.parse(item.content);
                    jsonData.isHidden = hide;
                    newContent = JSON.stringify(jsonData, null, 4);
                }

                await updateFile(item.path, newContent, item.sha, token, commitMessage);

                // Update local state
                item.isHidden = hide;
                item.content = newContent;

                // We need to get the new SHA after update
                const updatedFile = await fetchFileContent(item.path, token);
                item.sha = updatedFile.sha;

                success++;

                if ((i + 1) % 5 === 0 || i === itemsToUpdate.length - 1) {
                    log(`Đã xử lý ${i + 1}/${itemsToUpdate.length}...`, 'info');
                }

            } catch (error) {
                failed++;
                log(`✗ Lỗi ${action.toLowerCase()} ${item.name}: ${error.message}`, 'error');
            }

            setProgress(((i + 1) / itemsToUpdate.length) * 100);

            // Rate limiting
            if (i < itemsToUpdate.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        showProgress(false);
        setProgress(0);

        if (failed === 0) {
            log(`✓ ${action} thành công ${success} mục!`, 'success');
        } else {
            log(`⚠ Hoàn tất với ${failed} lỗi. ${success}/${itemsToUpdate.length} thành công.`, 'warning');
        }

        // Clear selection and refresh display
        selectedItems.clear();
        document.getElementById('select-all').checked = false;
        applyFilters();

    } catch (error) {
        log(`✗ Lỗi: ${error.message}`, 'error');
        showProgress(false);
        setProgress(0);
    } finally {
        isOperationRunning = false;
        updateSelectionInfo();
    }
}

function updateMarkdownFrontmatter(content, key, value) {
    const match = content.match(/^(---\n)([\s\S]*?)(\n---)/);
    if (!match) return content;

    const frontmatter = match[2];
    const body = content.slice(match[0].length);

    // Check if key exists
    const keyRegex = new RegExp(`^${key}:\\s*.+$`, 'm');
    let newFrontmatter;

    if (keyRegex.test(frontmatter)) {
        // Update existing key
        newFrontmatter = frontmatter.replace(keyRegex, `${key}: ${value}`);
    } else {
        // Add new key
        newFrontmatter = frontmatter.trim() + `\n${key}: ${value}`;
    }

    return `---\n${newFrontmatter}\n---${body}`;
}

// =====================================================
// TAB SWITCHING
// =====================================================

function switchTab(tab) {
    currentTab = tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update search placeholder
    const searchInput = document.getElementById('filter-search');
    searchInput.placeholder = tab === 'products' ? 'Tên sản phẩm...' : 'Tên bài viết...';

    // Clear filters
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-search').value = '';

    // Load new data
    loadData();
}

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    const accessDenied = document.getElementById('access-denied');
    const mainContent = document.getElementById('main-content');

    const token = getGitHubToken();

    if (token) {
        if (mainContent) mainContent.classList.add('show');
        if (accessDenied) accessDenied.classList.remove('show');

        log('✓ Đã tìm thấy GitHub token', 'success');
        loadData();
    } else {
        if (accessDenied) accessDenied.classList.add('show');
        if (mainContent) mainContent.classList.remove('show');
    }
});
