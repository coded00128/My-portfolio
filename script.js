const body = document.body;
const themeToggle = document.querySelector('[data-theme-toggle]');
const menu = document.querySelector('#mainNavigation');

const savedTheme = localStorage.getItem('coded-theme');
if (savedTheme === 'light') body.classList.add('light-theme');

function updateThemeIcon() {
  if (!themeToggle) return;
  const icon = themeToggle.querySelector('i');
  if (icon) icon.className = body.classList.contains('light-theme') ? 'bi bi-moon-stars' : 'bi bi-sun';
  themeToggle.setAttribute('aria-label', body.classList.contains('light-theme') ? 'Switch to dark mode' : 'Switch to light mode');
}
updateThemeIcon();

themeToggle?.addEventListener('click', () => {
  body.classList.toggle('light-theme');
  localStorage.setItem('coded-theme', body.classList.contains('light-theme') ? 'light' : 'dark');
  updateThemeIcon();
});

document.querySelectorAll('.navbar .nav-link, .navbar .btn').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 992 && menu?.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });
});

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach(item => observer.observe(item));

const progressBars = document.querySelectorAll('.progress-bar[data-width]');
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.width;
      progressObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
progressBars.forEach(bar => progressObserver.observe(bar));

const filterButtons = document.querySelectorAll('[data-filter]');
const projectItems = document.querySelectorAll('[data-category]');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projectItems.forEach(item => {
      const show = filter === 'all' || item.dataset.category.includes(filter);
      item.classList.toggle('project-hidden', !show);
    });
  });
});

const repoGrid = document.querySelector('#githubProjects');
const githubStatus = document.querySelector('#githubStatus');

const featuredRepoRules = [
  { key: 'POS & Inventory', terms: ['business-inventory', 'inventory', 'pos'] },
  { key: 'Coded Lifestyle', terms: ['coded-lifestyle', 'codedlifestyle', 'portfolio'] },
  { key: 'PrimeLand Real Estate', terms: ['prime-land', 'primeland', 'real-estate', 'realestate'] },
  { key: 'Bright Future Academy', terms: ['bright-future', 'brightfuture', 'academy', 'school'] },
  { key: 'QS Estimator', terms: ['qs-estimator', 'quantity-survey', 'quantitysurvey', 'estimator'] }
];

function getFeaturedRepo(repo) {
  const normalized = repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return featuredRepoRules.find(rule => rule.terms.some(term => normalized.includes(term)));
}

async function loadGitHubProjects() {
  if (!repoGrid) return;
  try {
    const response = await fetch('https://api.github.com/users/coded00128/repos?sort=updated&per_page=100');
    if (!response.ok) throw new Error('GitHub request failed');

    const repos = await response.json();
    const featured = featuredRepoRules
      .map(rule => repos.find(repo => !repo.fork && getFeaturedRepo(repo)?.key === rule.key))
      .filter(Boolean);

    repoGrid.innerHTML = featured.length
      ? featured.map(repo => {
          const featuredRule = getFeaturedRepo(repo);
          return `
            <article class="github-card reveal revealed">
              <div class="github-card-top">
                <i class="bi bi-github"></i>
                <span>${featuredRule.key}</span>
              </div>
              <h3>${repo.name}</h3>
              <p>${repo.description || 'A featured project from my development work.'}</p>
              <div class="github-meta">
                <span><i class="bi bi-code-slash"></i> ${repo.language || 'Multiple technologies'}</span>
                <span><i class="bi bi-star"></i> ${repo.stargazers_count}</span>
              </div>
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View repository <i class="bi bi-arrow-up-right"></i></a>
            </article>`;
        }).join('')
      : '<p class="github-empty">Featured repositories are not available yet.</p>';

    if (githubStatus) githubStatus.textContent = `Showing ${featured.length} selected project${featured.length === 1 ? '' : 's'} from GitHub`;
  } catch (error) {
    if (githubStatus) githubStatus.textContent = 'GitHub projects could not be loaded right now';
    repoGrid.innerHTML = '<div class="github-fallback"><i class="bi bi-github"></i><p>Explore my selected projects directly on GitHub.</p><a class="btn btn-primary rounded-pill" href="https://github.com/coded00128" target="_blank" rel="noopener noreferrer">Open GitHub</a></div>';
  }
}
loadGitHubProjects();

const commandPalette = document.querySelector('#commandPalette');
const commandInput = document.querySelector('#commandInput');
const commandResults = document.querySelector('#commandResults');
const commands = [
  ['Home', '#hero', 'bi-house'], ['About', '#about', 'bi-person'], ['Work', '#projects', 'bi-grid'],
  ['Skills', '#skills', 'bi-code-slash'], ['GitHub', '#github', 'bi-github'], ['Contact', '#contact', 'bi-envelope'],
  ['Toggle theme', 'theme', 'bi-circle-half']
];
function renderCommands(query = '') {
  const matches = commands.filter(([name]) => name.toLowerCase().includes(query.toLowerCase()));
  commandResults.innerHTML = matches.map(([name, target, icon]) => `<button type="button" class="command-item" data-command="${target}"><i class="bi ${icon}"></i><span>${name}</span><i class="bi bi-arrow-up-right ms-auto"></i></button>`).join('');
  commandResults.querySelectorAll('.command-item').forEach(button => button.addEventListener('click', () => {
    const target = button.dataset.command;
    if (target === 'theme') themeToggle?.click();
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    closePalette();
  }));
}
function openPalette() { commandPalette?.classList.add('open'); commandPalette?.setAttribute('aria-hidden', 'false'); renderCommands(); setTimeout(() => commandInput?.focus(), 50); }
function closePalette() { commandPalette?.classList.remove('open'); commandPalette?.setAttribute('aria-hidden', 'true'); }
document.querySelector('[data-command-open]')?.addEventListener('click', openPalette);
commandInput?.addEventListener('input', e => renderCommands(e.target.value));
commandPalette?.addEventListener('click', e => { if (e.target === commandPalette) closePalette(); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
  if (e.key === 'Escape') closePalette();
});
renderCommands();

const contactForm = document.querySelector('#contactForm');
const formStatus = document.querySelector('#formStatus');
contactForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const button = contactForm.querySelector('button[type="submit"]');
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = 'Sending <span class="spinner-border spinner-border-sm ms-2" aria-hidden="true"></span>';
  try {
    const response = await fetch(contactForm.action, { method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Unable to send');
    contactForm.reset();
    formStatus.textContent = 'Message sent successfully. I will get back to you as soon as possible.';
    formStatus.className = 'form-status success';
  } catch {
    formStatus.textContent = 'Something went wrong. Please try again or contact me directly on WhatsApp.';
    formStatus.className = 'form-status error';
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
});

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();
