// Scroll reveal effect
function reveal() {
	const reveals = document.querySelectorAll('.reveal');
	for (let i = 0; i < reveals.length; i++) {
		const windowHeight = window.innerHeight;
		const elementTop = reveals[i].getBoundingClientRect().top;
		const revealPoint = 150;

		if (elementTop < windowHeight - revealPoint) {
			reveals[i].classList.add('active');
		}
	}
}

window.addEventListener('scroll', reveal);

const toggleBtn = document.getElementById('themeToggle');

if (toggleBtn) {
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

	// Load saved theme
	if (localStorage.getItem('theme') === 'dark') {
		document.body.classList.add('dark');
		toggleBtn.textContent = '☀️';
	}
}
