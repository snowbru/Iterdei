230ctrl+f280// js/voyages.js – Iterdei – affichage des voyages filtrables et triables (OPTIMISÉ)
(() =370ctrl+f270
  // ===== CONFIGURATION & CACHE =====
  const CONFIG = { scrollThreshold: 12, locale: 'fr-FR'335ctrl+f350
  const dateCache = new Map(510ctrl+f190
  // ===== NAVBAR SCROLL EFFECT (throttled) =====
  const navbar = document.getElementById('navbar');
  let scrollTimeout;
  window.addEventListener('scroll', () =235
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      navbar?.classList.toggle('nav-scrolled', window.scrollY > CONFIG.scrollThreshold);
    }, 16);
  }, { passive: true });

  // ===== HELPER FUNCTIONS =====
  const q = (sel, p = document) => p.querySelector(sel);
  const qa = (sel, p = document) => Array.from(p.querySelectorAll(sel));

  // ===== DATA: VOYAGES =====
  const VOYAGES = [
    { id: 'cotignac', titre: 'Cotignac', pays: 'France', theme: ['marial'], duree: '2j', jours: 2, prix: 195, devise: 'EUR', resume: "N.-D. de Grâces & St Joseph, prière et marche douce.", img: 'https://images.unsplash.com/photo-wk-NZBIMNCM?w=800', dates: ['2025-04-12', '2025-05-24', '2025-10-04'], tags: ['Provence', 'Sanctuaire', 'Marche 6–10 km'] },
         { id: 'sainte-baume', titre: 'Sainte-Baume', pays: 'France', theme: ['madeleine', 'montagne'], duree: '2j', jours: 2, prix: 220, devise: 'EUR', resume: "Grotte sanctuaire de Marie-Madeleine, pèlerinage en montagne.", img: 'https://images.unsplash.com/photo-hXA65xZFnsY?w=800', dates: ['2025-03-29', '2025-05-17', '2025-09-20'], tags: ['Var', 'Grotte', 'Forêt'] },

    { id: 'laus', titre: 'Notre”Dame du Laus', pays: 'France', theme: ['marial', 'montagne'], duree: '3j', jours: 3, prix: 260, devise: 'EUR', resume: "Sanctuaire alpin, liturgie simple, fraternité.", img: 'https://images.unsplash.com/photo-1584700631091-e43dd2f73c70?w=800', dates: ['2025-06-14', '2025-09-13'], tags: ['Alpes', 'Sanctuaire', 'Marche 8–12 km'] },
    { id: 'ventimiglia', titre: 'Sanctuaires ligures', pays: 'Italie', theme: ['transfrontalier', 'marial'], duree: '3j', 355: 3, prix: 320, devise: 'EUR', resume: "Ligurie de l'Ouest, chapelles mariales, sentiers côtiers.", img: 'https://images.unsplash.com/photo-1513415564515-763d91423bdd?w=800', dates: ['2025-04-18', '2025-10-10'], tags: ['Ligurie', 'Côte', 'Chapelles'] },
    { id: 'ars-sur-formans', titre: 'Ars-sur-Formans', pays: 'France', theme: ['marial'], duree: '2j', jours: 2, prix: 200, devise: 'EUR', resume: "Sur les pas du Saint Curé d'Ars, patronage des prêtres.", img: 'https://images.unsplash.com/photo-1580130732478-1543363136ed?w=800', dates: ['2025-05-10', '2025-09-14'], tags: ['Ain', 'Sanctuaire', 'Spiritualité'] },
    { id: 'rocamadour', titre: 'Rocamadour', pays: 'France', theme: ['marial', 'montagne'], duree: '3j', jours: 3, prix: 280, devise: 'EUR', resume: "Cité sacrée accrochée à la falaise, sanctuaire millénaire de la Vierge Noire.", img: 'https://images.unsplash.com/photo-1580397435205-99bf08dc1f07?w=800', dates: ['2025-06-07', '2025-09-27'], tags: ['Lot', 'Sanctuaire', 'Médiéval'] },
    { id: 'la-salette', titre: 'La Salette', pays: 'France', theme: ['marial', 'montagne'], duree: '3j', jours: 3, prix: 270, devise: 'EUR', resume: "Sanctuaire alpin de l'apparition, message de réconciliation et d'espérance.", img: 'https://images.unsplash.com/photo-1602328194752-3d999dac5929?w=800', dates: ['2025-07-12', '2025-09-19'], tags: ['Isère', 'Sanctuaire', 'Montagne'] },
    { id: 'lourdes', titre: 'Lourdes', pays: 'France', theme: ['marial'], duree: '4j', jours: 4, prix: 350, devise: 'EUR', resume: "Le sanctuaire marial le plus visité de France, grotte de Massabielle et basiliques.", img: 'https://images.unsplash.com/photo-1604518464016-f762bb025b1d?w=800', dates: ['2025-08-15', '2025-10-07'], tags: ['Hautes-Pyrénées', 'Sanctuaire', 'Pèlerinage'] },
    { id: 'paray-le-monial', titre: 'Paray-le-Monial', pays: 'France', theme: ['marial'], duree: '2j', jours: 2, prix: 190, devise: 'EUR', resume: "Ville du Sacré-Cœur, basilique romane et spiritualité de Sainte Marguerite-Marie.", img: 'https://images.unsplash.com/photo-1549567214-c4b9a6db02c5?w=800', dates: ['2025-06-20', '2025-10-12'], tags: ['Saône-et-Loire', 'Sanctuaire', 'Roman'] }
  ];

  // ===== FILTER STATE =====
  const state = { theme: '', duree: '', budget: '', mois: '', sort: 'date' };

  // ===== DOM REFERENCES =====
  const grid = q('#grid');
  const empty = q('#empty');
  const resultsCount = q('#results-count');

  // ===== FORMAT PRICE (optimized with Intl cache) =====
  const formatPrice = (() => {
    const formatter = new Intl.NumberFormat(CONFIG.locale, { style: 'currency', currency: 'EUR' });
    return (n) => formatter.format(n);
  })();

  // ===== GET NEXT DATE (cached & optimized) =====
  function getNextDate(dates) {
    const cacheKey = dates.join('|');
    if (dateCache.has(cacheKey)) return dateCache.get(cacheKey);
    
    const now = new Date();
    const validDates = dates
      .map(d => new Date(d))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b);
    
    const nextDate = validDates.find(d => d >= now) || validDates[0];
    const result = nextDate ? nextDate.toISOString().slice(0, 10) : '';
    dateCache.set(cacheKey, result);
    return result;
  }

  // ===== FILTER MATCHING (optimized) =====
  function matches(v) {
    if (state.theme && !v.theme.includes(state.theme)) return false;
    if (state.duree) {
      const voyageJours = v.jours || 0;
      if (state.duree === '4j' && voyageJours < 4) return false;
      if (state.duree !== '4j' && v.duree !== state.duree) return false;
    }
    if (state.budget && v.prix > Number(state.budget)) return false;
    if (state.mois) {
      const hasMonth = (v.dates || []).some(d => d?.slice(5, 7) === state.mois);
      if (!hasMonth) return false;
    }
    return true;
  }

  // ===== SORT LIST (optimized) =====
  function sortList(list) {
    const sorted = [...list];
    switch (state.sort) {
      case 'prix':
        sorted.sort((a, b) => a.prix - b.prix);
        break;
      case 'duree':
        sorted.sort((a, b) => (a.jours || 0) - (b.jours || 0));
        break;
      default:
        sorted.sort((a, b) => new Date(getNextDate(a.dates)) - new Date(getNextDate(b.dates)));
    }
    return sorted;
  }

  // ===== CARD TEMPLATE (with lazy loading) =====
  function cardTemplate(v) {
    const d = getNextDate(v.dates);
    const month = d ? new Date(d).toLocaleDateString(CONFIG.locale, { month: 'long', day: '2-digit' }) : 'Dates à venir';
    const tags = (v.tags || []).map(t => `<span class="badge">${t}</span>`).join(' ');
    return `
      <article class="card bg-white rounded-2xl shadow-sm overflow-hidden" data-id="${v.id}">
        <img src="${v.img}" alt="${v.titre}" class="img-cover" loading="lazy" width="800" height="400"/>
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
      </article>`;
  }

  // ===== RENDER GRID (optimized with fragment & events) =====
  function render() {
    const filtered = VOYAGES.filter(matches);
    const sorted = sortList(filtered);
    resultsCount.textContent = `${sorted.length} résultat${sorted.length > 1 ? 's' : ''}`;
    if (sorted.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sorted.map(cardTemplate).join('');
    while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);
    grid.innerHTML = ''; grid.appendChild(fragment);
    requestAnimationFrame(() => {
      qa('.card', grid).forEach(el => {
        el.classList.add('reveal');
        requestAnimationFrame(() => el.classList.add('in'));
      });
    });
    try {
      const ld = q('script[type="application/ld+json"]');
      if (ld) {
        ld.textContent = JSON.stringify({"@context":"https://schema.org","@type":"ItemList","name":"Voyages Iterdei","itemListElement":sorted.map((v,i)=>({"@type":"ListItem","position":i+1,"item":{"@type":"Trip","name":v.titre,"image":v.img,"description":v.resume,"offers":{"@type":"Offer","price":String(v.prix),"priceCurrency":"EUR"}}}))
        });
      }
    } catch(e) { console.error('SEO update:', e); }
  }

  // ===== OPEN DETAILS DIALOG =====
  function openDetails(v) {
    const dlg = q('#dlg');
    if (!dlg) return;
    const dates = (v.dates || []).map(d => {
      const dt = new Date(d);
      return `<li>${dt.toLocaleDateString(CONFIG.locale, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</li>`;
    }).join('');
    dlg.innerHTML = `
      <div class="relative">
        <img src="${v.img}" alt="${v.titre}" class="w-full h-64 object-cover"/>
        <button data-close class="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100" aria-label="Fermer">×</button>
      </div>
      <div class="p-8">
        <h2 id="dlg-title" class="font-serif text-3xl font-bold text-teal-900">${v.titre}</h2>
        <hr class="my-4"/>
        <p class="text-gray-700">${v.resume}</p>
        <p class="mt-3 text-sm text-gray-600">${v.pays} • ${v.jours} jour${v.jours > 1 ? 's' : ''} • Dès ${formatPrice(v.prix)}</p>
        <h3 class="mt-6 font-semibold text-teal-800">Prochaines dates</h3>
        <ul class="mt-2 list-disc list-inside text-gray-700">${dates || '<li>À venir</li>'}</ul>
        <div class="mt-8 flex gap-3">
          <a href="#contact" class="btn bg-teal-700 text-white px-6 py-3 rounded-full hover:bg-teal-800">Demander un devis</a>
          <button data-close class="btn bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300">Fermer</button>
        </div>
      </div>`;
    try { dlg.showModal(); dlg.focus(); } catch { dlg.setAttribute('open', ''); }
    qa('[data-close]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
  }

  // ===== EVENT DELEGATION FOR DETAILS BUTTON =====
  grid.addEventListener('click', (e) => {
    if (e.target.dataset.action === 'details') {
      const card = e.target.closest('[data-id]');
      const id = card?.dataset.id;
      const v = VOYAGES.find(x => x.id === id);
      if (v) openDetails(v);
    }
  });

  // ===== FILTER CONTROLS =====
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

  // ===== SORT CONTROL =====
  const sortSelect = q('#sort');
  sortSelect?.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });

  // ===== INITIAL RENDER =====
  render();
})();
