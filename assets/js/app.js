// Minimal client-side loader & renderer
// Loads data/devices.json and renders list; exposes renderDeviceById for device.html

(async function () {
	const res = await fetch('data/devices.json');
	window.devices = await res.json();

	// Index page rendering
	if (document.getElementById('list')) {
		renderList(window.devices);
		// search
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

	// Expose function to render detail by id
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

	function specRow(term, val) {
		if (!val) return '';
		return `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(val)}</dd>`;
	}

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
