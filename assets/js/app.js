// Minimal client-side loader & renderer with a queued renderDeviceById
// - Exposes window.renderDeviceById immediately so device.html can call it
// - Loads data/devices.json, then replaces the queued implementation with the real one
// - Renders index list and device detail pages
// queue for any render requests before data is loaded
const pending = [];

// temporary renderDeviceById that queues calls
window.renderDeviceById = function (id) {
	pending.push(id);
};

// Begin loading data and initialize the real app
(async function load() {
	try {
		const res = await fetch('data/devices.json');
		if (!res.ok) throw new Error('HTTP ' + res.status);
		window.devices = await res.json();
	} catch (err) {
		console.error('Failed to load data/devices.json', err);
		// replace with a no-op to avoid further errors
		window.renderDeviceById = () => {};
		// If on index, show a helpful message
		const list = document.getElementById('list');
		if (list) list.innerHTML = '<p>Failed to load device data. Check console for details.</p>';
		return;
	}

	// Real implementation of renderDeviceById (replaces the queued one)
	window.renderDeviceById = function (id) {
		const device = window.devices.find((d) => d.slug === id || d.id === id);
		const container = document.getElementById('device');
		if (!container) return;
		if (!device) {
			container.innerHTML = '<p>Device not found.</p>';
			return;
		}
		container.innerHTML = deviceDetailHtml(device);
	};

	// If index/list page is present, render the grid and wire search
	if (document.getElementById('list')) {
		renderList(window.devices);

		const input = document.getElementById('search');
		if (input) {
			input.addEventListener('input', (e) => {
				// typing clears any active filter
				clearActiveFilterButtons();

				const q = e.target.value.trim().toLowerCase();
				const filtered = window.devices.filter(
					(d) =>
						d.name.toLowerCase().includes(q) ||
						(d.year && String(d.year).includes(q)) ||
						(d.model && d.model.toLowerCase().includes(q))
				);
				renderList(filtered);
			});
		}

		// Wire filter buttons (iPhone / iPad / iPod)
		const filterButtons = document.querySelectorAll('.filter-button');
		if (filterButtons && filterButtons.length) {
			filterButtons.forEach((btn) => {
				btn.addEventListener('click', (e) => {
					const key = btn.dataset.filter;
					setActiveFilterButton(btn);

					let filtered = window.devices;
					if (key === 'iphone') {
						filtered = window.devices.filter(
							(d) =>
								(d.name || '').toLowerCase().includes('iphone') ||
								(d.model || '').toLowerCase().includes('iphone') ||
								(d.slug || '').toLowerCase().includes('iphone')
						);
					} else if (key === 'ipad') {
						filtered = window.devices.filter(
							(d) =>
								(d.name || '').toLowerCase().includes('ipad') ||
								(d.model || '').toLowerCase().includes('ipad') ||
								(d.slug || '').toLowerCase().includes('ipad')
						);
					} else if (key === 'ipod') {
						filtered = window.devices.filter(
							(d) =>
								(d.name || '').toLowerCase().includes('ipod') ||
								(d.model || '').toLowerCase().includes('ipod') ||
								(d.slug || '').toLowerCase().includes('ipod')
						);
					}
					// clear the search input when a filter button is used
					if (input) input.value = '';
					renderList(filtered);
				});
			});
		}
	}

	console.log(window.devices);

	// process any queued device render requests
	pending.forEach((id) => window.renderDeviceById(id));
	pending.length = 0;

	// --- helper functions (kept local) ---

	// Render the grid of cards into #list
	function renderList(list) {
		const container = document.getElementById('list');
		if (!container) return;
		container.innerHTML = '';
		if (!Array.isArray(list) || list.length === 0) {
			container.innerHTML = '<p>No devices match your search.</p>';
			return;
		}

		list.forEach((d) => {
			const card = document.createElement('section');
			card.className = 'card';

			// Build inner HTML safely using escaped values and semantic wrappers
			card.innerHTML = `
          <div class="card-image">
            <img src="${escapeHtml(d.image || 'assets/images/placeholder.jpg')}" alt="${escapeHtml(
				d.name
			)} image" loading="lazy" />
          </div>
          <div class="card-body">
            <h3>${escapeHtml(d.name)}</h3>
            <p class="meta">${escapeHtml(d.model || '')} • ${escapeHtml(String(d.year || ''))}</p>
            <p class="desc">${escapeHtml(d.description ? d.description.slice(0, 140) : '')}${
				d.description && d.description.length > 140 ? '…' : ''
			}</p>
            <a class="card-link" href="device.html?id=${encodeURIComponent(d.slug)}" aria-label="Read more about ${escapeHtml(
				d.name
			)}">Read more →</a>
          </div>
        `;
			container.appendChild(card);
		});
	}

	// Build HTML for the device detail view
	function deviceDetailHtml(device) {
		const specs = device.specs || {};
		return `
        <article class="device-detail">
          <header class="device-hero">
            <div class="device-image">
              <img src="${escapeHtml(device.image || 'assets/images/placeholder.jpg')}" alt="${escapeHtml(
					device.name
				)} image" />
            </div>
            <div class="device-meta">
              <h2>${escapeHtml(device.name)} ${device.model ? '— ' + escapeHtml(device.model) : ''}</h2>
              <p class="meta">${escapeHtml(device.year || '')} • Released: ${escapeHtml(device.released || '')}</p>
              <p class="lead">${escapeHtml(device.description || '')}</p>
              <dl class="specs">
                ${specRow('Storage', specs.storage_options ? arrayToString(specs.storage_options) : '')}
                ${specRow('Display', specs.display)}
                ${specRow('CPU', specs.cpu)}
                ${specRow('RAM', specs.ram)}
                ${specRow('Battery', specs.battery)}
                ${specRow('OS at launch', specs.os_at_launch)}
              </dl>
            </div>
          </header>

          <!-- Fun facts rendered as paragraphs for a wiki-like reading flow -->
          <section class="fun-facts">
            <h3>Fun facts</h3>
            ${
				Array.isArray(device.fun_facts)
					? device.fun_facts.map((f) => `<p class="fact">${escapeHtml(f)}</p>`).join('')
					: '<p>No fun facts yet.</p>'
			}
          </section>

          <!-- Sources rendered as paragraphs (each source on its own line) -->
          ${
				device.sources && device.sources.length
					? `<section class="sources"><h3>Sources</h3>${device.sources
							.map(
								(s) =>
									`<p class="source"><a href="${escapeHtml(
										s
									)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s)}</a></p>`
							)
							.join('')}</section>`
					: ''
			}
        </article>
      `;
	}

	// Helper to format spec rows
	function specRow(term, val) {
		if (!val) return '';
		return `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(val)}</dd>`;
	}

	// Convert arrays or comma-strings to a clean string for display
	function arrayToString(value) {
		if (!value) return '';
		if (Array.isArray(value)) return value.join(', ');
		return String(value);
	}

	// Small HTML escape helper to avoid injection issues
	function escapeHtml(str) {
		if (str === null || str === undefined) return '';
		return String(str)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');
	}

	// Set active filter button (visual + aria)
	function setActiveFilterButton(btn) {
		const buttons = document.querySelectorAll('.filter-button');
		buttons.forEach((b) => {
			b.classList.remove('active');
			b.setAttribute('aria-pressed', 'false');
		});
		btn.classList.add('active');
		btn.setAttribute('aria-pressed', 'true');
	}

	// Clear any active filter buttons
	function clearActiveFilterButtons() {
		const buttons = document.querySelectorAll('.filter-button');
		buttons.forEach((b) => {
			b.classList.remove('active');
			b.setAttribute('aria-pressed', 'false');
		});
	}
})();

// --- Theme handling (apply saved theme on every page and wire toggle if present) ---

// Apply saved theme immediately so pages without the toggle still reflect the user's choice
if (localStorage.getItem('theme') === 'dark') {
	document.body.classList.add('dark');
}

// Wire the toggle button if it exists on the page (index.html and device.html now have it)
(function wireThemeToggle() {
	const toggleBtn = document.getElementById('themeToggle');
	if (!toggleBtn) return;

	// Set initial icon based on currently applied theme
	toggleBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';

	toggleBtn.addEventListener('click', () => {
		document.body.classList.toggle('dark');

		if (document.body.classList.contains('dark')) {
			localStorage.setItem('theme', 'dark');
			toggleBtn.textContent = '☀️';
		} else {
			localStorage.setItem('theme', 'light');
			toggleBtn.textContent = '🌙';
		}
	});
})();
