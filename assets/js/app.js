// Minimal client-side loader & renderer with short comments
// Loads data/devices.json, renders the list, and exposes renderDeviceById

(async function () {
	// Load the JSON file with device entries
	const res = await fetch('data/devices.json');
	window.devices = await res.json();

	// If on the index/list page, render the grid
	if (document.getElementById('list')) {
		renderList(window.devices);

		// Wire up search input to filter the list
		const input = document.getElementById('search');
		if (input) {
			input.addEventListener('input', (e) => {
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
	}

	// Make a function available globally so device.html can call it
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

	// Render the grid of cards
	function renderList(list) {
		const container = document.getElementById('list');
		if (!container) return;
		container.innerHTML = '';
		if (list.length === 0) {
			container.innerHTML = '<p>No devices match your search.</p>';
			return;
		}
		list.forEach((d) => {
			const card = document.createElement('section');
			card.className = 'card';
			// Card HTML: image, title, meta, short desc, link to detail
			card.innerHTML = `
        <img src="${d.image || 'assets/images/placeholder.jpg'}" alt="${escapeHtml(d.name)} image" loading="lazy" />
        <h3>${escapeHtml(d.name)}</h3>
        <p class="meta">${escapeHtml(d.model || '')} • ${escapeHtml(String(d.year || ''))}</p>
        <p>${escapeHtml(d.description ? d.description.slice(0, 140) : '')}${
				d.description && d.description.length > 140 ? '…' : ''
			}</p>
        <a href="device.html?id=${encodeURIComponent(d.slug)}">Read more →</a>
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
          <img src="${device.image || 'assets/images/placeholder.jpg'}" alt="${escapeHtml(device.name)} image" />
          <div class="device-meta">
            <h2>${escapeHtml(device.name)} ${device.model ? '— ' + escapeHtml(device.model) : ''}</h2>
            <p class="meta">${escapeHtml(device.year || '')} • Released: ${escapeHtml(device.released || '')}</p>
            <p>${escapeHtml(device.description || '')}</p>
            <dl class="specs">
              ${specRow('Storage', specs.storage_options ? specs.storage_options.join(', ') : '')}
              ${specRow('Display', specs.display)}
              ${specRow('CPU', specs.cpu)}
              ${specRow('RAM', specs.ram)}
              ${specRow('Battery', specs.battery)}
              ${specRow('OS at launch', specs.os_at_launch)}
            </dl>
          </div>
        </header>

        <section class="fun-facts">
          <h3>Fun facts</h3>
          <ul>
            ${
				Array.isArray(device.fun_facts)
					? device.fun_facts.map((f) => `<li>${escapeHtml(f)}</li>`).join('')
					: '<li>No fun facts yet.</li>'
			}
          </ul>
        </section>

        ${
			device.sources && device.sources.length
				? `<section class="sources"><h3>Sources</h3><ul>${device.sources
						.map(
							(s) =>
								`<li><a href="${escapeHtml(s)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
									s
								)}</a></li>`
						)
						.join('')}</ul></section>`
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

	// Small HTML escape helper to avoid injection issues
	function escapeHtml(str) {
		if (!str && str !== 0) return '';
		return String(str)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');
	}
})();
