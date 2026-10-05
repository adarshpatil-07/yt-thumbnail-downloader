/**
 * YT Thumbnail Downloader - Core Application Logic
 * Supports parsing all YouTube link formats, fetching video details via oEmbed,
 * detecting missing/placeholder thumbnail sizes, one-click file downloads,
 * and clipboard copying.
 */

// Thumbnail Quality Specifications
const THUMBNAIL_QUALITIES = [
  {
    key: 'maxresdefault',
    title: 'Maximum HD Quality',
    label: 'Max HD (1280x720)',
    resolution: '1280 × 720 px',
    aspectRatio: '16:9 Aspect Ratio',
    badge: '1080p / 720p',
    qualityName: 'maxres',
    tag: 'Best'
  },
  {
    key: 'sddefault',
    title: 'Standard HD Quality',
    label: 'Standard HD (640x480)',
    resolution: '640 × 480 px',
    aspectRatio: '4:3 Aspect Ratio',
    badge: '480p',
    qualityName: 'sd'
  },
  {
    key: 'hqdefault',
    title: 'High Quality (HQ)',
    label: 'High Quality (480x360)',
    resolution: '480 × 360 px',
    aspectRatio: 'Standard',
    badge: 'HQ',
    qualityName: 'hq'
  },
  {
    key: 'mqdefault',
    title: 'Medium Quality (MQ)',
    label: 'Medium Quality (320x180)',
    resolution: '320 × 180 px',
    aspectRatio: 'Compact',
    badge: 'MQ',
    qualityName: 'mq'
  },
  {
    key: 'default',
    title: 'Small / Default',
    label: 'Small (120x90)',
    resolution: '120 × 90 px',
    aspectRatio: 'Thumbnail Icon',
    badge: 'SD',
    qualityName: 'default'
  }
];

let currentVideoTitle = '';
let currentVideoId = '';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initDownloader();
});

/**
 * Initialize Dark / Light Mode Toggle
 */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');

  if (!themeToggleBtn) return;

  function updateIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      lightIcon?.classList.remove('hidden');
      darkIcon?.classList.add('hidden');
    } else {
      lightIcon?.classList.add('hidden');
      darkIcon?.classList.remove('hidden');
    }
  }

  updateIcons();

  themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    updateIcons();
  });
}

/**
 * Initialize Tool Form Event Listeners & State
 */
function initDownloader() {
  const form = document.getElementById('downloader-form');
  const input = document.getElementById('yt-url-input');
  const clearBtn = document.getElementById('clear-input-btn');

  if (!form || !input) return;

  // Toggle clear button visibility on typing
  input.addEventListener('input', () => {
    if (input.value.trim().length > 0) {
      clearBtn?.classList.remove('hidden');
    } else {
      clearBtn?.classList.add('hidden');
    }
    hideError();
  });

  // Clear button click
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    hideError();
    hideCorsNotice();
    hideResults();
    input.focus();
  });

  // Form submit (or Enter key press)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    processUrl(input.value.trim());
  });

  // Process initial URL if present on load
  if (input.value.trim()) {
    clearBtn?.classList.remove('hidden');
    processUrl(input.value.trim());
  }
}

/**
 * Parse YouTube Video ID from all supported URL formats or bare ID
 * @param {string} inputStr 
 * @returns {string|null}
 */
function extractVideoId(inputStr) {
  if (!inputStr) return null;
  const str = inputStr.trim();

  // 1. Bare 11-character Video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // 2. Comprehensive YouTube URL regex matcher
  // Matches: watch?v=ID, /v/ID, /embed/ID, /shorts/ID, /live/ID, youtu.be/ID, m.youtube.com/...
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/|m\.youtube\.com\/(?:watch\?.*v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);

  return match ? match[1] : null;
}

/**
 * Main Processing Function
 */
async function processUrl(urlValue) {
  hideError();
  hideCorsNotice();

  const videoId = extractVideoId(urlValue);

  if (!videoId) {
    showError('Invalid YouTube URL or Video ID. Please check the link and try again.');
    hideResults();
    return;
  }

  currentVideoId = videoId;
  currentVideoTitle = '';

  setLoadingState(true);

  try {
    // 1. Fetch Video Metadata via oEmbed
    await fetchVideoMetadata(videoId);

    // 2. Verify and render available thumbnails
    await renderThumbnails(videoId);

    showResults();
  } catch (err) {
    console.error('Error processing thumbnails:', err);
    showError('An unexpected error occurred while fetching thumbnails. Please try again.');
  } finally {
    setLoadingState(false);
  }
}

/**
 * Fetch Video Title and Channel Name via YouTube oEmbed
 */
async function fetchVideoMetadata(videoId) {
  const videoInfoEl = document.getElementById('video-info');
  const videoTitleEl = document.getElementById('video-title');
  const channelNameEl = document.getElementById('channel-name');

  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error('oEmbed fetch failed');
    const data = await res.json();

    if (data && data.title) {
      currentVideoTitle = data.title;
      if (videoTitleEl) videoTitleEl.textContent = data.title;
      if (channelNameEl) {
        channelNameEl.innerHTML = `
          <span>${escapeHtml(data.author_name || 'YouTube Channel')}</span>
          <svg class="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
        `;
      }
      videoInfoEl?.classList.remove('hidden');
      console.log('oEmbed request succeeded for video:', data.title);
      return;
    }
  } catch (err) {
    console.warn('oEmbed request blocked or failed:', err);
    videoInfoEl?.classList.add('hidden');
  }
}

/**
 * Verify whether an image URL exists and is not a 120x90 placeholder
 * @param {string} url 
 * @returns {Promise<boolean>}
 */
function verifyImageAvailable(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // YouTube serves a 120x90 gray placeholder image for non-existent maxres/sd resolutions
      if (img.naturalWidth <= 120 || img.naturalHeight <= 90) {
        resolve(false);
      } else {
        resolve(true);
      }
    };
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Render thumbnail cards into the grid
 */
async function renderThumbnails(videoId) {
  const cardsGrid = document.getElementById('cards-grid');
  const qualityCountBadge = document.getElementById('quality-count-badge');
  if (!cardsGrid) return;

  cardsGrid.innerHTML = '';
  let availableCount = 0;

  // Asynchronously check all 5 quality levels
  const checkPromises = THUMBNAIL_QUALITIES.map(async (item) => {
    const imageUrl = `https://img.youtube.com/vi/${videoId}/${item.key}.jpg`;
    const isAvailable = await verifyImageAvailable(imageUrl);
    return { ...item, imageUrl, isAvailable };
  });

  const results = await Promise.all(checkPromises);

  results.forEach((item) => {
    if (!item.isAvailable) return;

    availableCount++;
    const cardEl = createThumbnailCard(item);
    cardsGrid.appendChild(cardEl);
  });

  if (qualityCountBadge) {
    qualityCountBadge.textContent = `${availableCount} Quality ${availableCount === 1 ? 'Option' : 'Options'} Found`;
  }
}

/**
 * Create a thumbnail card DOM element
 */
function createThumbnailCard(item) {
  const card = document.createElement('div');
  card.className = 'thumbnail-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden';

  const downloadFileName = currentVideoTitle
    ? `${slugify(currentVideoTitle)}-${item.qualityName}.jpg`
    : `thumbnail-${currentVideoId}-${item.qualityName}.jpg`;

  card.innerHTML = `
    <div class="relative bg-slate-900 aspect-video group overflow-hidden">
      <img src="${item.imageUrl}" alt="${escapeHtml(item.title)} Preview" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
      <span class="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide">
        ${escapeHtml(item.label)}
      </span>
    </div>
    <div class="p-5 flex flex-col flex-grow justify-between gap-4">
      <div>
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-bold text-slate-900 dark:text-white">${escapeHtml(item.title)}</h3>
          ${item.tag ? `<span class="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">${escapeHtml(item.tag)}</span>` : ''}
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">Resolution: ${escapeHtml(item.resolution)} &bull; ${escapeHtml(item.aspectRatio)}</p>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" class="btn-download px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Download</span>
        </button>
        <button type="button" class="btn-copy px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <span class="copy-label">Copy Link</span>
        </button>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const downloadBtn = card.querySelector('.btn-download');
  const copyBtn = card.querySelector('.btn-copy');

  downloadBtn?.addEventListener('click', () => {
    downloadImage(item.imageUrl, downloadFileName);
  });

  copyBtn?.addEventListener('click', () => {
    copyLink(item.imageUrl, copyBtn);
  });

  return card;
}

/**
 * Handle Image File Download with Blob + `<a download>`
 * Falls back to new tab if blocked by CORS
 */
async function downloadImage(imageUrl, fileName) {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error('Fetch status not OK');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
  } catch (err) {
    console.warn('Direct image download blocked by CORS, opening in new tab fallback:', err);
    showCorsNotice();
    window.open(imageUrl, '_blank');
  }
}

/**
 * Copy Thumbnail URL to Clipboard
 */
async function copyLink(url, buttonEl) {
  const labelSpan = buttonEl.querySelector('.copy-label');

  try {
    await navigator.clipboard.writeText(url);
    if (labelSpan) {
      const originalText = labelSpan.textContent;
      labelSpan.textContent = 'Copied!';
      buttonEl.classList.add('text-emerald-600', 'border-emerald-500');
      setTimeout(() => {
        labelSpan.textContent = originalText;
        buttonEl.classList.remove('text-emerald-600', 'border-emerald-500');
      }, 2000);
    }
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    if (labelSpan) {
      labelSpan.textContent = 'Copied!';
      setTimeout(() => { labelSpan.textContent = 'Copy Link'; }, 2000);
    }
  }
}

/**
 * UI Helper Functions
 */
function setLoadingState(isLoading) {
  const getBtn = document.getElementById('get-btn');
  const btnText = document.getElementById('btn-text');
  const searchIcon = document.getElementById('btn-search-icon');
  const spinner = document.getElementById('btn-spinner');

  if (getBtn) getBtn.disabled = isLoading;

  if (isLoading) {
    searchIcon?.classList.add('hidden');
    spinner?.classList.remove('hidden');
    if (btnText) btnText.textContent = 'Loading...';
  } else {
    spinner?.classList.add('hidden');
    searchIcon?.classList.remove('hidden');
    if (btnText) btnText.textContent = 'Get Thumbnail';
  }
}

function showError(msg) {
  const errorEl = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  if (errorText) errorText.textContent = msg;
  errorEl?.classList.remove('hidden');
}

function hideError() {
  const errorEl = document.getElementById('error-message');
  errorEl?.classList.add('hidden');
}

function showCorsNotice() {
  const noticeEl = document.getElementById('cors-notice');
  noticeEl?.classList.remove('hidden');
}

function hideCorsNotice() {
  const noticeEl = document.getElementById('cors-notice');
  noticeEl?.classList.add('hidden');
}

function showResults() {
  const resultsSec = document.getElementById('results-section');
  resultsSec?.classList.remove('hidden');
}

function hideResults() {
  const cardsGrid = document.getElementById('cards-grid');
  const videoInfoEl = document.getElementById('video-info');
  if (cardsGrid) cardsGrid.innerHTML = '';
  videoInfoEl?.classList.add('hidden');
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
