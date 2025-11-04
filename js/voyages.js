// js/voyages.js – Iterdei – affichage des voyages filtrables et triables

(() => {
  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('nav-scrolled', window.scrollY > 12);
  });

  // Helper functions
  const q = (sel, p = document) => p.querySelector(sel);
  const qa = (sel, p = document) => [...p.querySelectorAll(sel)];

  // Data: voyages collection
  const VOYAGES = [
    {
      id: 'cotignac',
      titre: 'Cotignac',
      pays: 'France',
      theme: ['marial'],
      duree: '2j',
      jours: 2,
      prix: 180,
      devise: 'EUR',
      resume: "N.-D. de Grâces & St Joseph, prière et marche douce.",
      img: './assets/voyages/cotignac.jpg',
      dates: ['2025-04-12', '2025-05-24', '2025-10-04'],
      tags: ['Provence', 'Sanctuaire', 'Marche 6–10 km']
    },
    {
      id: 'sainte-baume',
      titre: 'Sainte‑Baume',
      pays: 'France',
      theme: ['madeleine', 'montagne'],
      duree: '2j',
      jours: 2,
      prix: 160,
      devise: 'EUR',
      resume: "Grotte Ste‑Marie‑Madeleine, forêt relique et crête.",
      img: './assets/voyages/sainte-baume.jpg',
      dates: ['2025-03-29', '2025-05-17', '2025-09-20'],
      tags: ['Var', 'Grotte', 'Forêt']
    },
    {
      id: 'laus',
      titre: 'Notre‑Dame du Laus',
      pays: 'France',
      theme: ['marial', 'montagne'],
      duree: '3j',
      jours: 3,
      prix: 260,
      devise: 'EUR',
      resume: "Sanctuaire alpin, liturgie simple, fraternité.",
      img: './assets/voyages/laus.jpg',
      dates: ['2025-06-14', '2025-09-13'],
      tags: ['Alpes', 'Sanctuaire', 'Marche 8–12 km']
    },
    {
      id: 'ventimiglia',
      titre: 'Sanctuaires ligures',
      pays: 'Italie',
      theme: ['transfrontalier', 'marial'],
      duree: '3j',
      jours: 3,
      prix: 320,
      devise: 'EUR',
      resume: "Ligurie de l'Ouest, chapelles mariales, sentiers côtiers.",
      img: './assets/voyages/ligurie.jpg',
      dates: ['2025-04-18', '2025-10-10'],
      tags: ['Ligurie', 'Côte', 'Chapelles']
    }
  ];

  // Filter state
  const state = {
    theme: '',
    duree: '',
    budget: '',
    mois: '',
    sort: 'date'
  };

  // DOM references
  const grid = q('#grid');
  const empty = q('#empty');
  const resultsCount = q('#results-count');

  // Format price
  function formatPrice(n) {
    try {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
    } catch {
      return n + ' €';
    }
  }

  // Get next available date
  function nextDate(dates) {
    const now = new Date();
    const arr = dates.map(d => new Date(d)).filter(d => !isNaN(d));
    arr.sort((a, b) => a - b);
    const nd = arr.find(d => d >= now) || arr[0];
    return nd ? nd.toISOString().slice(0, 10) : '';
  }

  // Check if voyage matches filters
  function matches(v) {
    if (state.theme && !v.theme.includes(state.theme)) return false;
    if (state.duree) {
      if (state.duree === '4j' && (v.jours || 0) < 4) return false;
      if (state.duree !== '4j' && v.duree !== state.duree) return false;
    }
    if (state.budget && v.prix > Number(state.budget)) return false;
    if (state.mois) {
      const hasMonth = (v.dates || []).some(d => (d || '').slice(5, 7) === state.mois);
      if (!hasMonth) return false;
    }
    return true;
  }

  // Sort voyages list
  function sortList(list) {
    const cp = [...list];
    if (state.sort === 'prix') cp.sort((a, b) => a.prix - b.prix);
    else if (state.sort === 'duree') cp.sort((a, b) => (a.jours || 0) - (b.jours || 0));
    else cp.sort((a, b) => new Date(nextDate(a.dates)) - new Date(nextDate(b.dates)));
    return cp;
  }

  // Card template
  function cardTemplate(v) {
    const d = nextDate(v.dates);
    const month = d ? new Date(d).toLocaleDateString('fr-FR', { month: 'long', day: '2-digit' }) : 'Dates à venir';
    const tags = (v.tags || []).map(t => `<span class="badge">${t}</span>`).join(' ');
    return `
      <article class="card bg-white rounded-2xl shadow-sm overflow-hidden" data-id="${v.id}">
        <img src="${v.img}" alt="${v.titre}" class="img-cover"/>
        <div class="p-5">
          <h3 class="font-serif text-xl font-bold text-teal-900">${v.titre}</h3>
          <p class="text-sm text-gray-600 mt-1">${v.pays} • ${v.jours} jour${v.jours > 1 ? 's' : ''}</p>
          <p class="mt-3 text-gray-700">${v.resume}</p>
          <div class="mt-3 flex flex-wrap gap-2">${tags}</div>
          <div class="mt-4 flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500">Prochaine date : ${month}</p>
              <p class="text-lg font-semibold text-teal-800 mt-1">Dès ${formatPrice(v.prix)}</p>
            </div>
            <button data-action="details" class="btn bg-teal-700 text-white px-4 py-2 rounded-full hover:bg-teal-800">Détails</button>
          </div>
          <a href="#contact" class="mt-3 block text-center text-sm text-teal-700 hover:underline">Demander un devis</a>
        </div>
      </article>
    `;
  }

  // Render the grid
  function render() {
    const filtered = VOYAGES.filter(matches);
    const sorted = sortList(filtered);
    resultsCount.textContent = `${sorted.length} résultat${sorted.length > 1 ? 's' : ''}`;

    if (sorted.length === 0) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    grid.innerHTML = sorted.map(cardTemplate).join('');

    // Attach detail button handlers
    qa('[data-action="details"]', grid).forEach(btn =>
      btn.addEventListener('click', e => {
        const card = e.currentTarget.closest('[data-id]');
        const id = card ? card.dataset.id : null;
        const v = VOYAGES.find(x => x.id === id);
        if (v) openDetails(v);
      })
    );

    // Reveal animation
    qa('.card', grid).forEach(el => {
      el.classList.add('reveal');
      requestAnimationFrame(() => el.classList.add('in'));
    });

    // Update structured data for SEO
    try {
      const ld = q('script[type="application/ld+json"]');
      if (ld) {
        const data = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Voyages Iterdei",
          "itemListElement": sorted.map((v, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "Trip",
              "name": v.titre,
              "image": v.img,
              "description": v.resume,
              "offers": { "@type": "Offer", "price": String(v.prix), "priceCurrency": "EUR" }
            }
          }))
        };
        ld.textContent = JSON.stringify(data);
      }
    } catch {}
  }

  // Open details dialog
  function openDetails(v) {
    const dlg = q('#dlg');
    if (!dlg) return;
    const dates = (v.dates || [])
      .map(d => {
        const dt = new Date(d);
        return `<li>${dt.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</li>`;
      })
      .join('');
    dlg.innerHTML = `
      <div class="relative">
        <img src="${v.img}" alt="${v.titre}" class="w-full h-64 object-cover"/>
        <button data-close class="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100" aria-label="Fermer">
          ×
        </button>
      </div>
      <div class="p-8">
        <h2 id="dlg-title" class="font-serif text-3xl font-bold text-teal-900">${v.titre}</h2>
        <hr class="my-4"/>
        <p class="text-gray-700">${v.resume}</p>
        <p class="mt-3 text-sm text-gray-600">${v.pays} • ${v.jours} jour${v.jours > 1 ? 's' : ''} • Dès **${formatPrice(v.prix)}**</p>
        <h3 class="mt-6 font-semibold text-teal-800">Prochaines dates</h3>
        <ul class="mt-2 list-disc list-inside text-gray-700">${dates || '<li>À venir</li>'}</ul>
        <div class="mt-8 flex gap-3">
          <a href="#contact" class="btn bg-teal-700 text-white px-6 py-3 rounded-full hover:bg-teal-800">Demander un devis</a>
          <button data-close class="btn bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300">Fermer</button>
        </div>
      </div>
    `;

    try {
      dlg.showModal();
      dlg.focus();
    } catch {
      dlg.setAttribute('open', '');
    }

    // Close handlers
    qa('[data-close]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
  }

  // Filter controls
  const filters = q('#filters');
  if (filters) {
    q('#btn-apply', filters)?.addEventListener('click', () => {
      state.theme = q('#f-theme', filters)?.value || '';
      state.duree = q('#f-duree', filters)?.value || '';
      state.budget = q('#f-budget', filters)?.value || '';
      state.mois = q('#f-mois', filters)?.value || '';
      render();
    });
    q('#btn-reset', filters)?.addEventListener('click', () => {
      ['#f-theme', '#f-duree', '#f-budget', '#f-mois'].forEach(sel => {
        const el = q(sel, filters);
        if (el) el.value = '';
      });
      state.theme = state.duree = state.budget = state.mois = '';
      render();
    });
  }

  // Sort control
  const sortSelect = q('#sort');
  sortSelect?.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });

  // Initial render
  render();
})();
