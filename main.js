/* ================================================
   Sunscape Tour and Travels — MAIN.JS
   All interactivity for the website
   ================================================ */

/* ---- NAVBAR SCROLL ---- */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ---- MOBILE NAV TOGGLE ---- */
function toggleNav() {
  const drawer = document.getElementById('navDrawer');
  const icon   = document.getElementById('menuIcon');
  if (!drawer) return;
  const isOpen = drawer.classList.toggle('open');
  if (icon) icon.textContent = isOpen ? 'close' : 'menu';
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// Close drawer on link click
document.querySelectorAll('.nav-drawer a').forEach(link => {
  link.addEventListener('click', () => {
    const drawer = document.getElementById('navDrawer');
    const icon   = document.getElementById('menuIcon');
    if (drawer) drawer.classList.remove('open');
    if (icon) icon.textContent = 'menu';
    document.body.style.overflow = '';
  });
});

/* ---- FAQ ACCORDION ---- */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-q.open').forEach(q => {
    q.classList.remove('open');
    if (q.nextElementSibling) q.nextElementSibling.style.display = 'none';
  });
  // Open clicked one if it was closed
  if (!isOpen && answer) {
    btn.classList.add('open');
    answer.style.display = 'block';
  }
}

/* ---- SCROLL REVEAL ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- TOURS PAGE: STATE TABS ---- */
let activeState = 'all';

function setStateTab(state, btn) {
  activeState = state;
  document.querySelectorAll('.state-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  filterTours();
}

/* ---- TOURS PAGE: FILTER ---- */
function filterTours() {
  const keyword  = (document.getElementById('fKeyword')?.value || '').toLowerCase().trim();
  const budget   = document.getElementById('fBudget')?.value || '';
  const duration = document.getElementById('fDuration')?.value || '';
  const checkedCats = Array.from(
    document.querySelectorAll('.f-check-group input[type="checkbox"]:checked')
  ).map(c => c.value);

  const cards = document.querySelectorAll('#tourGrid .tour-card');
  let visible = 0;

  cards.forEach(card => {
    const state    = card.dataset.state || '';
    const cat      = card.dataset.cat   || '';
    const price    = parseInt(card.dataset.price || '0');
    const dur      = card.dataset.dur   || '';
    const text     = card.innerText.toLowerCase();

    let show = true;

    // State tab
    if (activeState !== 'all' && state !== activeState) show = false;

    // Keyword
    if (keyword && !text.includes(keyword)) show = false;

    // Budget ranges
    if (budget) {
      const bNum = parseInt(budget);
      if (bNum === 20000 && price >= 25000) show = false;
      if (bNum === 30000 && (price < 25000 || price > 40000)) show = false;
      if (bNum === 50000 && (price < 40000 || price > 60000)) show = false;
      if (bNum === 99999 && price <= 60000) show = false;
    }

    // Duration
    if (duration) {
      if (duration === 'short'  && dur !== 'short')  show = false;
      if (duration === 'medium' && dur !== 'medium') show = false;
      if (duration === 'long'   && dur !== 'long')   show = false;
    }

    // Categories (multi-select)
    if (checkedCats.length > 0 && !checkedCats.includes(cat)) show = false;

    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Update count
  const countEl = document.getElementById('resultCount');
  if (countEl) countEl.textContent = visible + ' Destination' + (visible !== 1 ? 's' : '') + ' Found';

  // No results message
  const noRes = document.getElementById('noResults');
  if (noRes) noRes.style.display = visible === 0 ? 'block' : 'none';
}

function clearFilters() {
  const kw = document.getElementById('fKeyword');
  const bd = document.getElementById('fBudget');
  const dr = document.getElementById('fDuration');
  if (kw) kw.value = '';
  if (bd) bd.value = '';
  if (dr) dr.value = '';
  document.querySelectorAll('.f-check-group input[type="checkbox"]').forEach(c => c.checked = false);
  activeState = 'all';
  document.querySelectorAll('.state-tab').forEach(t => t.classList.remove('active'));
  const allTab = document.querySelector('.state-tab');
  if (allTab) allTab.classList.add('active');
  filterTours();
}

/* ---- TOURS: SORT ---- */
function sortTours(value) {
  const grid  = document.getElementById('tourGrid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.tour-card'));
  cards.sort((a, b) => {
    if (value === 'price-asc')  return parseInt(a.dataset.price) - parseInt(b.dataset.price);
    if (value === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
    if (value === 'rating')     return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
    return 0;
  });
  cards.forEach(c => grid.appendChild(c));
}

/* ---- TOURS: VIEW TOGGLE (grid / list) ---- */
function setView(mode, btn) {
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const grid = document.getElementById('tourGrid');
  if (!grid) return;
  if (mode === 'list') {
    grid.style.gridTemplateColumns = '1fr';
    grid.querySelectorAll('.tour-card').forEach(card => {
      card.style.display = 'flex';
      const img = card.querySelector('.t-img');
      if (img) { img.style.width = '260px'; img.style.flexShrink = '0'; img.style.height = 'auto'; }
    });
  } else {
    grid.style.gridTemplateColumns = '';
    grid.querySelectorAll('.tour-card').forEach(card => {
      card.style.display = '';
      const img = card.querySelector('.t-img');
      if (img) { img.style.width = ''; img.style.flexShrink = ''; img.style.height = ''; }
    });
  }
}

/* ---- AUTO-APPLY STATE FROM URL ---- */
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const state  = params.get('state');
  if (state) {
    const btn = document.querySelector(`.state-tab[onclick*="'${state}'"]`);
    if (btn) setStateTab(state, btn);
  }
});

/* ---- CONTACT FORM SUBMIT ---- */
// ============================================================
// TO CONNECT FORM TO EMAIL (Formspree — free, no backend needed):
//   1. Go to https://formspree.io → sign up free
//   2. Create a new form → copy your endpoint URL
//   3. Replace 'YOUR_FORMSPREE_ENDPOINT' below with that URL
//      e.g. 'https://formspree.io/f/xyzabc12'
//
// If left as 'YOUR_FORMSPREE_ENDPOINT', form data will open
// WhatsApp with enquiry details (works immediately, no setup).
// ============================================================
const FORMSPREE = 'YOUR_FORMSPREE_ENDPOINT';
// CHANGE the WhatsApp number below too (with country code, no +)
const WA_NUMBER = '919999999999';

function handleFormSubmit(e) {
  e.preventDefault();
  const form      = document.getElementById('contactForm');
  const successEl = document.getElementById('formSuccess');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!form) return;

  // Collect form data
  const data = Object.fromEntries(new FormData(form));

  if (FORMSPREE !== 'YOUR_FORMSPREE_ENDPOINT') {
    // ---- Formspree submission ----
    if (submitBtn) { submitBtn.textContent = 'Sending…'; submitBtn.disabled = true; }
    fetch(FORMSPREE, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(res => {
      if (res.ok) {
        form.style.display = 'none';
        if (successEl) successEl.style.display = 'block';
      } else {
        alert('Something went wrong. Please WhatsApp us directly.');
        if (submitBtn) { submitBtn.textContent = 'Send Enquiry'; submitBtn.disabled = false; }
      }
    })
    .catch(() => {
      alert('Network error. Please WhatsApp us directly.');
      if (submitBtn) { submitBtn.textContent = 'Send Enquiry'; submitBtn.disabled = false; }
    });

  } else {
    // ---- Fallback: open WhatsApp with form details ----
    const msg = `Hi! I want to enquire about a tour package.

Name: ${data.name || ''}
Phone: ${data.phone || ''}
Destination: ${data.destination || ''}
Travel Date: ${data.travel_date || ''}
Travellers: ${data.travellers || ''}
Pickup: ${data.pickup || ''}
Message: ${data.message || ''}`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

    // Also show success
    form.style.display = 'none';
    if (successEl) successEl.style.display = 'block';
  }
}

/* ---- NEWSLETTER ---- */
function subscribeNL() {
  const inp = document.getElementById('nlEmail');
  const btn = document.querySelector('.nl-form button');
  if (!inp || !inp.value.includes('@')) {
    if (inp) { inp.style.outline = '2px solid #c62828'; setTimeout(() => inp.style.outline = '', 2000); }
    return;
  }
  if (btn) { btn.textContent = 'Subscribed ✓'; btn.style.background = '#388e3c'; }
  inp.value = '';
}

/* ---- ITINERARY EXPAND (package page) ---- */
function expandItin(wrapperId, btnId) {
  document.querySelectorAll(`#${wrapperId} .itin-collapsed`).forEach(el => el.style.display = 'grid');
  const btn = document.getElementById(btnId);
  if (btn) btn.style.display = 'none';
}

/* HERO SEARCH */
function heroSearch(){

  const destination = document.getElementById('heroDestination').value;
  const budget = document.getElementById('heroBudget').value;

  let url = 'destinations.html?';

  if(destination){
    url += 'state=' + destination;
  }

  if(budget){
    url += '&budget=' + budget;
  }

  window.location.href = url;
}

/* APPLY URL FILTERS */
window.addEventListener('DOMContentLoaded', () => {

  const params = new URLSearchParams(window.location.search);

  const state  = params.get('state');
  const budget = params.get('budget');

  /* STATE FILTER */
  if(state){

    activeState = state;

    document.querySelectorAll('.state-tab').forEach(tab => {

      tab.classList.remove('active');

      const text = tab.textContent.toLowerCase();

      if(text.includes(state)){
        tab.classList.add('active');
      }

    });

  }

  /* BUDGET FILTER */
  if(budget){

    const budgetSelect = document.getElementById('fBudget');

    if(budgetSelect){
      budgetSelect.value = budget;
    }

  }

  /* APPLY FILTERS */
  filterTours();

});


function handleFormSubmit(event){

  event.preventDefault();

  const form = document.getElementById("contactForm");

  const name = form.name.value;
  const phone = form.phone.value;
  const email = form.email.value;
  const destination = form.destination.value;
  const travelDate = form.travel_date.value;
  const travellers = form.travellers.value;
  const pickup = form.pickup.value;
  const message = form.message.value;

  const whatsappMessage = `New Tour Enquiry

Full Name: ${name}

Phone Number: ${phone}

Email: ${email}

Destination: ${destination}

Travel Date: ${travelDate}

Travellers: ${travellers}

Pickup Point: ${pickup}

Message:
${message}`;

  const whatsappURL =
`https://wa.me/916230208955?text=${encodeURIComponent(whatsappMessage)}`;

  window.open(whatsappURL, "_blank");

  document.getElementById("formSuccess").style.display = "flex";

  form.reset();

}


const canonicalTag = document.createElement("link");

canonicalTag.setAttribute("rel", "canonical");

canonicalTag.setAttribute(
  "href",
  window.location.origin + window.location.pathname
);

document.head.appendChild(canonicalTag);