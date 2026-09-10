const places = [
  {id:'corner-space', name:'The Corner Space', type:'Community', city:'London', distance:'0.6 km', image:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=82', fallback:'assets/cafe.svg', tags:['Community','Events','Coffee'], blurb:'A warm neighbourhood space for talks, workshops and unhurried conversation.', address:'17 Willow Street, London', hours:'08:00 – 20:00'},
  {id:'greenwood-park', name:'Greenwood Park', type:'Outdoors', city:'London', distance:'1.2 km', image:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82', fallback:'assets/park.svg', tags:['Outdoors','Wellbeing','Free'], blurb:'Green space for walking groups, quiet time and local weekend activities.', address:'Greenwood Park, London', hours:'Open daily'},
  {id:'makers-yard', name:'Makers Yard', type:'Arts & Culture', city:'London', distance:'1.8 km', image:'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=82', fallback:'assets/art.svg', tags:['Arts','Workshops','Community'], blurb:'A creative venue bringing local makers, learners and neighbours together.', address:'48 Mercer Lane, London', hours:'10:00 – 19:00'},
  {id:'harbour-table', name:'Harbour Table', type:'Food & Drinks', city:'Bristol', distance:'2.4 km', image:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82', fallback:'assets/friends.svg', tags:['Food','Meetups','Inclusive'], blurb:'Shared tables, local supper clubs and relaxed community evenings.', address:'9 Harbour Walk, Bristol', hours:'11:00 – 22:00'},
  {id:'common-ground', name:'Common Ground', type:'Learning', city:'Manchester', distance:'3.1 km', image:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=82', fallback:'assets/community.svg', tags:['Learning','Talks','Students'], blurb:'A welcoming place for peer learning, discussion circles and practical sessions.', address:'22 Newton Street, Manchester', hours:'09:00 – 18:00'},
  {id:'slow-sunday-club', name:'Slow Sunday Club', type:'Wellbeing', city:'Leeds', distance:'3.7 km', image:'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=1200&q=82', fallback:'assets/walk.svg', tags:['Wellbeing','Walking','Social'], blurb:'Low-pressure Sunday walks created for people who want easy, human connection.', address:'Roundhay Park, Leeds', hours:'Sundays 10:30'}
];

function setActiveNav(){
  const page = document.body.dataset.page || 'home';
  document.querySelectorAll('[data-nav]').forEach(a => {
    if(a.dataset.nav === page) a.classList.add('active');
  });
}

function initMobileNav(){
  const btn = document.querySelector('[data-menu-btn]');
  const menu = document.querySelector('[data-mobile-menu]');
  if(!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  });
}

function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)) { items.forEach(x=>x.classList.add('visible')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }});
  }, {threshold:.12});
  items.forEach(x=>io.observe(x));
}

function cardHTML(p){
  const saved = JSON.parse(localStorage.getItem('adandraSaved') || '[]').includes(p.id);
  return `<article class="place-card reveal" data-place-card data-name="${p.name.toLowerCase()}" data-type="${p.type.toLowerCase()}" data-tags="${p.tags.join(' ').toLowerCase()}">
    <div class="place-image-wrap">
      <img src="${p.image}" onerror="this.onerror=null;this.src=\'${p.fallback}\'" alt="${p.name}" class="place-image">
      <button class="save-btn ${saved?'saved':''}" data-save="${p.id}" aria-label="Save ${p.name}">${saved?'♥':'♡'}</button>
      <span class="distance-pill">${p.distance}</span>
    </div>
    <div class="place-body">
      <div class="eyebrow">${p.type} · ${p.city}</div>
      <h3>${p.name}</h3>
      <p>${p.blurb}</p>
      <div class="tag-row">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>
      <a class="text-link" href="place.html?id=${p.id}">View place <span>→</span></a>
    </div>
  </article>`;
}

function renderPlaces(selector='[data-place-grid]', limit=null){
  const grid = document.querySelector(selector);
  if(!grid) return;
  const list = limit ? places.slice(0,limit) : places;
  grid.innerHTML = list.map(cardHTML).join('');
  initSaveButtons();
  initReveal();
}

function initSaveButtons(){
  document.querySelectorAll('[data-save]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      const id = btn.dataset.save;
      let saved = JSON.parse(localStorage.getItem('adandraSaved') || '[]');
      if(saved.includes(id)) saved = saved.filter(x=>x!==id); else saved.push(id);
      localStorage.setItem('adandraSaved', JSON.stringify(saved));
      const nowSaved = saved.includes(id);
      document.querySelectorAll(`[data-save="${id}"]`).forEach(b=>{b.classList.toggle('saved',nowSaved); b.textContent = nowSaved?'♥':'♡';});
      showToast(nowSaved ? 'Saved for later' : 'Removed from saved');
    };
  });
}

function initExplore(){
  const grid = document.querySelector('[data-place-grid]');
  if(!grid) return;
  renderPlaces();
  const search = document.querySelector('[data-search]');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  let active = 'all';
  function apply(){
    const q = (search?.value || '').trim().toLowerCase();
    let count = 0;
    document.querySelectorAll('[data-place-card]').forEach(card=>{
      const hay = `${card.dataset.name} ${card.dataset.type} ${card.dataset.tags}`;
      const matchQ = !q || hay.includes(q);
      const matchF = active==='all' || card.dataset.type.includes(active);
      const show = matchQ && matchF;
      card.style.display = show ? '' : 'none';
      if(show) count++;
    });
    const empty = document.querySelector('[data-empty]');
    if(empty) empty.hidden = count !== 0;
    const countEl = document.querySelector('[data-result-count]');
    if(countEl) countEl.textContent = `${count} place${count===1?'':'s'} found`;
  }
  search?.addEventListener('input', apply);
  buttons.forEach(b=>b.addEventListener('click', ()=>{
    active = b.dataset.filter;
    buttons.forEach(x=>x.classList.toggle('active',x===b));
    apply();
  }));
  apply();
}

function initPlacePage(){
  const mount = document.querySelector('[data-place-detail]');
  if(!mount) return;
  const id = new URLSearchParams(location.search).get('id') || places[0].id;
  const p = places.find(x=>x.id===id) || places[0];
  document.title = `${p.name} — adandra concept`;
  mount.innerHTML = `
    <section class="place-hero">
      <img src="${p.image}" onerror="this.onerror=null;this.src=\'${p.fallback}\'" alt="${p.name}">
      <div class="place-hero-overlay"></div>
      <div class="container place-hero-copy">
        <a class="back-link" href="explore.html">← Back to Explore</a>
        <div class="eyebrow light">${p.type} · ${p.city}</div>
        <h1>${p.name}</h1>
        <p>${p.blurb}</p>
      </div>
    </section>
    <section class="section">
      <div class="container detail-grid">
        <div>
          <div class="section-kicker">Why people come here</div>
          <h2>A place designed around presence, not pressure.</h2>
          <p class="lead">Discover what is happening, understand the atmosphere before you arrive, and choose a simple next step that feels comfortable.</p>
          <div class="feature-list compact">
            <div><span>01</span><div><strong>Know before you go</strong><p>Clear information about the place, its purpose and what to expect.</p></div></div>
            <div><span>02</span><div><strong>Join at your pace</strong><p>No noisy feed. Save it, follow it, or simply visit in person.</p></div></div>
            <div><span>03</span><div><strong>Real-world first</strong><p>The technology helps you get there, then gets out of the way.</p></div></div>
          </div>
        </div>
        <aside class="info-card sticky-card">
          <div class="eyebrow">Place information</div>
          <h3>${p.name}</h3>
          <div class="info-row"><span>Address</span><strong>${p.address}</strong></div>
          <div class="info-row"><span>Hours</span><strong>${p.hours}</strong></div>
          <div class="info-row"><span>Distance</span><strong>${p.distance}</strong></div>
          <button class="btn btn-primary full" data-checkin="${p.id}">I’m here / Check in</button>
          <button class="btn btn-secondary full" data-save="${p.id}">Save place</button>
          <a class="btn btn-ghost full" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}">Open directions ↗</a>
          <p class="microcopy">Concept interaction: check-in is stored only in this browser.</p>
        </aside>
      </div>
    </section>`;
  initSaveButtons();
  const check = mount.querySelector('[data-checkin]');
  check?.addEventListener('click',()=>{
    localStorage.setItem(`checked-${p.id}`, new Date().toISOString());
    check.textContent = 'Checked in ✓'; check.disabled = true;
    showToast(`Checked in at ${p.name}`);
  });
  if(localStorage.getItem(`checked-${p.id}`)){ check.textContent='Checked in ✓'; check.disabled=true; }
}

function initJoinButtons(){
  document.querySelectorAll('[data-join]').forEach(btn=>{
    const key = `joined-${btn.dataset.join}`;
    if(localStorage.getItem(key)){ btn.textContent='Joined ✓'; btn.classList.add('joined'); }
    btn.addEventListener('click',()=>{
      const joined = !localStorage.getItem(key);
      if(joined){ localStorage.setItem(key,'1'); btn.textContent='Joined ✓'; }
      else { localStorage.removeItem(key); btn.textContent='Join community'; }
      btn.classList.toggle('joined',joined);
      showToast(joined?'Community joined':'Community left');
    });
  });
}

function initDashboardTabs(){
  document.querySelectorAll('[data-dash-tab]').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('[data-dash-tab]').forEach(t=>t.classList.toggle('active',t===tab));
      document.querySelectorAll('[data-dash-panel]').forEach(p=>p.hidden=p.dataset.dashPanel!==tab.dataset.dashTab);
    });
  });
}

function initContact(){
  const form=document.querySelector('[data-contact-form]');
  if(!form) return;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const name=fd.get('name')?.trim(); const email=fd.get('email')?.trim(); const msg=fd.get('message')?.trim();
    if(!name || !email || !msg){ showToast('Please complete all required fields'); return; }
    const subject=encodeURIComponent(`adandra concept enquiry from ${name}`);
    const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
    location.href=`mailto:?subject=${subject}&body=${body}`;
  });
  document.querySelector('[data-copy-message]')?.addEventListener('click',async()=>{
    const msg=form.querySelector('[name="message"]').value || '';
    if(!msg.trim()){ showToast('Write a message first'); return; }
    try{ await navigator.clipboard.writeText(msg); showToast('Message copied'); }
    catch{ showToast('Could not access clipboard'); }
  });
}

function showToast(message){
  let toast=document.querySelector('.toast');
  if(!toast){ toast=document.createElement('div'); toast.className='toast'; document.body.appendChild(toast); }
  toast.textContent=message; toast.classList.add('show');
  clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);
}

function initYear(){ document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear()); }

function boot(){
  setActiveNav(); initMobileNav(); initReveal(); initYear();
  if(document.body.dataset.page==='home') renderPlaces('[data-home-places]',3);
  if(document.body.dataset.page==='explore') initExplore();
  initPlacePage(); initJoinButtons(); initDashboardTabs(); initContact();
}

document.addEventListener('DOMContentLoaded',boot);
