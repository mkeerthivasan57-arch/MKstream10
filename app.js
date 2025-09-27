// MKstream - client JS (handles UI, data, player, admin features)
(() => {
  // simple client-side DB using localStorage
  const DB_KEY = "mkstream_db_v1";
  const DEFAULT = {
    site: {name:"MKstream", logo:"", colors:{header:"#071233", accent:"#1e90ff"}, font:"Inter"},
    categories:["anime","donghua","cartoon","serial","web series","movies"],
    series: [
      {
        id:"s1", title:"Sample Series Alpha", category:"anime", subcategory:"action", thumb:"https://picsum.photos/seed/a/400/225",
        versions:{ original: true, dubbed: ["hi","ta"] },
        episodes: [
          {num:1,name:"Ep 1 - Pilot",servers:[{name:"Server 1",type:"src",src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"},{name:"YouTube Demo",type:"embed",src:"https://www.youtube.com/embed/tgbNymZ7vqY"}],subs:[{lang:"en",src:"data/subs/sample.vtt"}],views:120},
          {num:2,name:"Ep 2 - Rising",servers:[{name:"Server 1",type:"src",src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}],subs:[],views:90},
          {num:3,name:"Ep 3 - Clash",servers:[{name:"Server 1",type:"src",src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}],subs:[],views:120}
        ],
        uploaded_at: new Date().toISOString()
      }
    ],
    ads: {code:"", frequency:120},
    auth:{password:"admin123"}
  };

  function loadDB(){ try{const raw=localStorage.getItem(DB_KEY); if(raw) return JSON.parse(raw); localStorage.setItem(DB_KEY,JSON.stringify(DEFAULT)); return DEFAULT;}catch(e){console.error(e); return DEFAULT;} }
  function saveDB(db){ localStorage.setItem(DB_KEY,JSON.stringify(db)); }
  let DB = loadDB();

  // header and menu
  const menu = document.getElementById("side-menu");
  const hamburger = document.getElementById("hamburger");
  const menuClose = document.getElementById("menu-close");
  const menuCats = document.getElementById("menu-cats");
  const headerCats = document.getElementById("header-cats");
  const adminBtn = document.getElementById("admin-btn");
  const searchToggle = document.getElementById("search-toggle");
  const searchOverlay = document.getElementById("search-overlay");
  const searchInput = document.getElementById("search-input");
  const searchClose = document.getElementById("search-close");
  const siteNameEl = document.getElementById("site-name");
  const logoEl = document.getElementById("logo");

  function renderHeaderCats(){
    headerCats.innerHTML = "";
    DB.categories.forEach(c=>{
      const b = document.createElement("button");
      b.className="cat-btn";
      b.textContent = c;
      b.onclick = ()=>goToCategory(c);
      headerCats.appendChild(b);
    });
  }
  function renderMenuCats(){
    menuCats.innerHTML="";
    const homeLi = document.createElement("li");
    homeLi.innerHTML = '<button class="menu-item" onclick="location.href=\\'index.html\\'">🏠 Home</button>';
    menuCats.appendChild(homeLi);
    DB.categories.forEach(c=>{
      const li = document.createElement("li");
      li.innerHTML = `<button class="menu-item" data-cat="${c}">${c}</button>`;
      menuCats.appendChild(li);
    });
    // add delegated click
    menuCats.querySelectorAll(".menu-item").forEach(el=> el.addEventListener("click", (ev)=>{
      const cat = ev.currentTarget.dataset.cat;
      if(cat) { closeMenu(); goToCategory(cat); } else { closeMenu(); location.href='index.html'; }
    }));
  }

  function openMenu(){ menu.classList.add("open"); menu.setAttribute("aria-hidden","false"); }
  function closeMenu(){ menu.classList.remove("open"); menu.setAttribute("aria-hidden","true"); }

  hamburger?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);

  function goToCategory(cat){
    // simple filter: navigate to index and show category results
    localStorage.setItem("mk_last_cat", cat);
    location.href = "index.html#cat="+encodeURIComponent(cat);
  }

  adminBtn?.addEventListener("click", ()=>{ location.href="admin.html"; });

  searchToggle?.addEventListener("click", ()=>{ searchOverlay.hidden=false; searchInput.focus(); });
  searchClose?.addEventListener("click", ()=>{ searchOverlay.hidden=true; searchInput.value=""; });

  searchInput?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") runSearch(searchInput.value); });
  function runSearch(q){ q=q.trim().toLowerCase(); if(!q) return; const results = []; DB.series.forEach(s=>{
    if(s.title.toLowerCase().includes(q)) results.push(s);
    s.episodes.forEach(ep=>{ if(ep.name && ep.name.toLowerCase().includes(q)) results.push(s); });
  }); // very basic nav
    if(results.length) { localStorage.setItem("mk_search_results", JSON.stringify(results.map(r=>r.id))); location.href="index.html#search=" + encodeURIComponent(q); } else alert("No results found");
  }

  // render home / grids
  const recentGrid = document.getElementById("recent-grid");
  const mostGrid = document.getElementById("most-grid");
  const catList = document.getElementById("category-list");
  const todaysSpecial = document.getElementById("todays-special");
  const yesterdaySpecial = document.getElementById("yesterday-special");

  function buildCard(s){
    const div = document.createElement("div"); div.className="card";
    const img = document.createElement("img"); img.loading="lazy"; img.src=s.thumb; img.alt=s.title;
    const h = document.createElement("h4"); h.textContent=s.title;
    const p = document.createElement("p"); p.className="small-muted"; p.textContent = `${s.episodes.length} eps • ${s.category}`;
    const a = document.createElement("button"); a.className="blue-box"; a.textContent="Play"; a.onclick = ()=> openPlayerForSeries(s.id, 1);
    div.appendChild(img); div.appendChild(h); div.appendChild(p); div.appendChild(a);
    return div;
  }

  function renderHome(){
    recentGrid.innerHTML=""; mostGrid.innerHTML=""; catList.innerHTML=""; todaysSpecial.innerHTML=""; yesterdaySpecial.innerHTML="";
    const todayStr = new Date().toISOString().slice(0,10);
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    // 'Today's special' logic: pick the latest uploaded series with uploaded_at date = today; if none, keep yesterday
    let todays = DB.series.filter(s=> (s.uploaded_at||"").slice(0,10) === todayStr );
    let yest = DB.series.filter(s=> (s.uploaded_at||"").slice(0,10) === yesterday );
    if(todays.length===0 && yest.length>0){
      // show yesterday's in todays and show nothing in yesterday-special
      todaysSpecial.appendChild(buildCard(yest[0]));
      // fill yesterday as empty message
      yesterdaySpecial.innerHTML = '<p class="small-muted">Waiting for today\'s special — showing yesterday until today uploads.</p>';
    } else if(todays.length>0){
      todaysSpecial.appendChild(buildCard(todays[0]));
      if(yest.length>0) yesterdaySpecial.appendChild(buildCard(yest[0]));
    } else {
      todaysSpecial.innerHTML = '<p class="small-muted">No special available today.</p>';
    }
    // recently uploaded sorted by uploaded_at desc
    const recentList = DB.series.slice().sort((a,b)=> new Date(b.uploaded_at||0)-new Date(a.uploaded_at||0));
    recentList.slice(0,8).forEach(s=> recentGrid.appendChild(buildCard(s)));
    // most viewed (sort by highest total views sum)
    const withViews = DB.series.map(s=> ({...s, totalViews: s.episodes.reduce((acc,e)=>acc+(e.views||0),0)})).sort((a,b)=>b.totalViews-a.totalViews);
    withViews.slice(0,8).forEach(s=> mostGrid.appendChild(buildCard(s)));
    // categories
    DB.categories.forEach(c=>{
      const d = document.createElement("div"); d.className="cat";
      d.innerHTML = `<strong>${c}</strong><div class="small-muted">View category</div>`;
      d.onclick = ()=> goToCategory(c);
      catList.appendChild(d);
    });
  }

  // open player page in a popup-like simple overlay (single-page behaviour)
  function openPlayerForSeries(seriesId, episodeNum){
    // prepare & navigate to player UI (we'll implement a quick in-page player overlay)
    localStorage.setItem("mk_player_open", JSON.stringify({seriesId,episodeNum}));
    location.href = "player.html";
  }

  // init menus & render
  renderHeaderCats();
  renderMenuCats();
  renderHome();

  // simple load more handlers (for demo, they just append more same items)
  document.getElementById("recent-loadmore").addEventListener("click", ()=>{
    const more = DB.series.slice(0,4);
    more.forEach(s=> recentGrid.appendChild(buildCard(s)));
  });
  document.getElementById("most-loadmore").addEventListener("click", ()=>{
    const more = DB.series.slice(0,4);
    more.forEach(s=> mostGrid.appendChild(buildCard(s)));
  });

  // live update of site name/logo if admin changed
  function applySiteSettings(){
    const site = DB.site || {};
    siteNameEl.textContent = site.name || "MKstream";
    document.getElementById("site-name").textContent = site.name || "MKstream";
    if(site.logo){ logoEl.src = site.logo; logoEl.style.display="inline-block"; }
  }
  applySiteSettings();

  // ---------- Admin page JS (shared in same file) ----------
  // If admin.html present, attach admin behaviors
  if(location.pathname.endsWith("admin.html")){
    const loginSection = document.getElementById("login-section");
    const loginBtn = document.getElementById("login-btn");
    const loginPass = document.getElementById("login-pass");
    const adminPanel = document.getElementById("admin-panel");
    const logoutBtn = document.getElementById("logout-btn");

    function checkAuth(){ return sessionStorage.getItem("mk_admin_authed")==="1"; }
    function setAuth(val){ sessionStorage.setItem("mk_admin_authed", val?"1":"0"); }

    if(checkAuth()){ loginSection.hidden=true; adminPanel.hidden=false; populateEditor(); } else { loginSection.hidden=false; adminPanel.hidden=true; }

    loginBtn.addEventListener("click", ()=>{
      const pass = loginPass.value || "";
      if(pass === DB.auth.password){ setAuth(true); loginSection.hidden=true; adminPanel.hidden=false; populateEditor(); } else alert("Wrong password");
    });
    logoutBtn.addEventListener("click", ()=>{ setAuth(false); location.href="index.html"; });

    // category creation
    document.getElementById("add-cat").addEventListener("click", ()=>{
      const name = document.getElementById("new-category").value.trim();
      if(!name) return alert("Enter category name");
      if(!DB.categories.includes(name)) DB.categories.push(name);
      saveDB(DB); alert("Category added"); populateEditor(); renderHeaderCats(); renderMenuCats(); renderHome();
    });

    document.getElementById("add-subcat").addEventListener("click", ()=>{
      // for simplicity, store subcategories inside series entries or separate map - we'll keep a mapping
      const name = document.getElementById("new-subcat").value.trim();
      const parent = document.getElementById("subcat-parent").value;
      if(!name || !parent) return alert("Need name & parent");
      DB._subcats = DB._subcats || {}; DB._subcats[parent]=DB._subcats[parent]||[];
      if(!DB._subcats[parent].includes(name)) DB._subcats[parent].push(name);
      saveDB(DB); alert("Subcategory added"); populateEditor();
    });

    document.getElementById("add-server").addEventListener("click", ()=>{
      const list = document.getElementById("servers-list");
      const idx = Date.now();
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<input placeholder="Server name" class="sname"/><select class="stype"><option value="src">Direct src</option><option value="embed">Embed (iframe)</option></select><input placeholder="Source URL" class="ssrc"/><button class="remove-server">Remove</button>`;
      list.appendChild(wrapper);
      wrapper.querySelector(".remove-server").addEventListener("click", ()=> wrapper.remove());
    });
    document.getElementById("add-sub").addEventListener("click", ()=>{
      const list = document.getElementById("subs-list");
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<input placeholder="Language code (en,hi,ta)" class="slang"/><input placeholder="Subtitle URL (.vtt)" class="ssub"/><button class="remove-sub">Remove</button>`;
      list.appendChild(wrapper);
      wrapper.querySelector(".remove-sub").addEventListener("click", ()=> wrapper.remove());
    });

    function populateEditor(){
      // populate selects of categories & subcats
      const catSel = document.getElementById("editor-cat");
      const subSel = document.getElementById("editor-subcat");
      const subParent = document.getElementById("subcat-parent");
      [catSel,subSel,subParent].forEach(s=> s.innerHTML="");
      DB.categories.forEach(c=>{
        [catSel,subSel,subParent].forEach(sel=> sel.appendChild(new Option(c,c)));
      });
      // subcats mapping
      document.getElementById("we-name").value = DB.site.name||"";
      document.getElementById("we-logo").value = DB.site.logo||"";
      document.getElementById("we-color-header").value = DB.site.colors?.header || "#071233";
      document.getElementById("we-color-accent").value = DB.site.colors?.accent || "#1e90ff";
      document.getElementById("we-font").value = DB.site.font || "Inter";
    }

    document.getElementById("save-upload").addEventListener("click", ()=>{
      const cat = document.getElementById("editor-cat").value;
      const subcat = document.getElementById("editor-subcat").value;
      const title = document.getElementById("series-title").value.trim();
      const epnum = parseInt(document.getElementById("episode-number").value||0);
      const epname = document.getElementById("episode-name").value.trim();
      const thumb = document.getElementById("thumb-url").value.trim();
      const embed = document.getElementById("embed-or-url").value.trim();

      if(!title || !epnum || (!embed && !thumb)) return alert("Please fill required fields (title, episode number, embed/url, thumb)");
      // build servers
      const servers = [];
      document.querySelectorAll("#servers-list > div").forEach(div=>{
        const name = div.querySelector(".sname").value||"Server";
        const type = div.querySelector(".stype").value||"src";
        const src = div.querySelector(".ssrc").value||"";
        if(src) servers.push({name,type,src});
      });
      const subs = [];
      document.querySelectorAll("#subs-list > div").forEach(div=>{
        const lang = div.querySelector(".slang").value||"en";
        const src = div.querySelector(".ssub").value||"";
        if(src) subs.push({lang,src});
      });

      // find or create series
      let series = DB.series.find(s=> s.title.toLowerCase()===title.toLowerCase() && s.category===cat);
      if(!series){
        series = {id:"s"+Date.now(), title, category:cat, subcategory:subcat, thumb:thumb, episodes:[], uploaded_at:new Date().toISOString(), versions:{original:true}, views:0};
        DB.series.push(series);
      }
      const ep = {num:epnum,name:epname,servers:servers.length?servers:[{name:"Default",type:"src",src:embed}],subs,views:0};
      // replace if same epnum exists
      series.episodes = series.episodes.filter(e=>e.num!==epnum);
      series.episodes.push(ep);
      series.episodes.sort((a,b)=>a.num-b.num);
      saveDB(DB); alert("Uploaded/Updated successfully"); renderHome(); populateEditor();
    });

    // save web settings
    document.getElementById("we-save").addEventListener("click", ()=>{
      DB.site.name = document.getElementById("we-name").value||DB.site.name;
      DB.site.logo = document.getElementById("we-logo").value||DB.site.logo;
      DB.site.colors = DB.site.colors || {};
      DB.site.colors.header = document.getElementById("we-color-header").value;
      DB.site.colors.accent = document.getElementById("we-color-accent").value;
      DB.site.font = document.getElementById("we-font").value;
      saveDB(DB); applySiteSettings(); alert("Web settings saved");
    });

    document.getElementById("ad-save").addEventListener("click", ()=>{
      DB.ads.code = document.getElementById("ad-code").value;
      DB.ads.frequency = parseInt(document.getElementById("ad-frequency").value||120);
      saveDB(DB); alert("Ads saved");
    });

    document.getElementById("change-pass").addEventListener("click", ()=>{
      const np = document.getElementById("new-pass").value || "";
      if(np.length<4) return alert("Choose a stronger password");
      DB.auth.password = np; saveDB(DB); alert("Password changed");
    });

    populateEditor();
  } // end admin page block

  // player page handling: player.html opened flag
  if(location.pathname.endsWith("player.html")){
    // we'll build a simple player UI using the stored mk_player_open
    const PL_HTML = `
      <div class="player-wrapper">
        <div id="player-title"></div>
        <div id="player-area"></div>
        <div class="video-controls" id="video-controls">
          <select id="server-select" class="server-select"></select>
          <select id="quality-select" class="quality-select"></select>
          <select id="lang-select" class="lang-select"></select>
          <button id="download-btn" class="blue-box">Download</button>
        </div>
        <div id="episode-ranges" class="episode-ranges"></div>
        <div id="episode-list" class="episode-list"></div>
        <div id="related" class="related"></div>
      </div>
    `;
    document.body.innerHTML = '<header class="site-header"><div class="brand">MKstream Player</div></header>' + PL_HTML;
    const info = JSON.parse(localStorage.getItem("mk_player_open")||"null");
    const playerArea = document.getElementById("player-area");
    const titleEl = document.getElementById("player-title");
    const serverSelect = document.getElementById("server-select");
    const qualitySelect = document.getElementById("quality-select");
    const langSelect = document.getElementById("lang-select");
    const downloadBtn = document.getElementById("download-btn");
    const epRanges = document.getElementById("episode-ranges");
    const epList = document.getElementById("episode-list");
    const related = document.getElementById("related");

    if(!info){ playerArea.innerHTML = "<p>No series selected</p>"; throw "no player info"; }
    const series = DB.series.find(s=> s.id===info.seriesId);
    if(!series){ playerArea.innerHTML="<p>Series not found</p>"; throw "no series"; }
    let currentEpisode = series.episodes.find(e=>e.num===info.episodeNum) || series.episodes[0];

    function buildPlayerForEpisode(ep){
      playerArea.innerHTML = "";
      // pick first src server of type 'src', otherwise embed iframe
      const srcServer = ep.servers.find(s=>s.type==="src");
      const embedServer = ep.servers.find(s=>s.type==="embed");
      if(srcServer){
        const vid = document.createElement("video");
        vid.id="mk-video";
        vid.controls=true;
        vid.src = srcServer.src;
        vid.crossOrigin="anonymous";
        vid.setAttribute("playsinline","");
        vid.style.maxWidth = "100%";
        // add tracks
        ep.subs.forEach(s=>{
          const t = document.createElement("track"); t.kind="subtitles"; t.srclang=s.lang; t.src=s.src; t.label=s.lang; vid.appendChild(t);
        });
        playerArea.appendChild(vid);
        attachPlayerGestures(vid);
        downloadBtn.onclick = ()=> { const a = document.createElement("a"); a.href = vid.currentSrc; a.download = ""; document.body.appendChild(a); a.click(); a.remove(); };
        vid.onended = ()=>{ autoPlayNext(); }
      } else if(embedServer){
        playerArea.innerHTML = `<div class="embed-wrap" style="position:relative;padding-top:56.25%"><iframe src="${embedServer.src}" frameborder="0" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe></div>`;
        downloadBtn.onclick = ()=> alert("Download not available for embed sources");
      } else {
        playerArea.innerHTML = "<p>No playable source</p>";
      }

      // server dropdown
      serverSelect.innerHTML=""; ep.servers.forEach((s,idx)=>{
        const opt = document.createElement("option"); opt.value=idx; opt.textContent=s.name + (s.type==="embed"?" (embed)":"");
        serverSelect.appendChild(opt);
      });
      serverSelect.onchange = ()=>{ const s = ep.servers[parseInt(serverSelect.value)]; if(!s) return; if(s.type==="src"){ const v = document.getElementById("mk-video"); if(v){ v.src=s.src; v.play(); } } else { playerArea.innerHTML = `<div style="position:relative;padding-top:56.25%"><iframe src="${s.src}" frameborder="0" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%"></iframe></div>`; } };

      // quality: based on server src naming (demo) we'll just offer low/med/high if multiple srcs exist
      qualitySelect.innerHTML = "<option value='auto'>Auto</option><option value='low'>Low</option><option value='med'>Medium</option><option value='high'>High</option>";
      qualitySelect.onchange = ()=>{ const v = document.getElementById("mk-video"); if(!v) return; if(qualitySelect.value==="low") v.playbackRate = 0.9; else if(qualitySelect.value==="high") v.playbackRate=1.0; else v.playbackRate=1.0; };

      // language versions
      langSelect.innerHTML = "";
      const versions = series.versions || {};
      const langs = [];
      if(versions.original) langs.push("original");
      if(versions.dubbed) langs.push(...versions.dubbed);
      langs.forEach(l=> { const o=document.createElement("option"); o.value=o.textContent=l; langSelect.appendChild(o); });
      langSelect.onchange = ()=>{ // simulate open series in other lang: for demo just alert or filter series list
        alert("Switching to language: " + langSelect.value + " (this would open the series in that language)");
      };

      // episode ranges generation (1-100,101-200...)
      epRanges.innerHTML = "";
      const total = series.episodes.length;
      const ranges = [];
      for(let i=1;i<=total;i+=100){ const end = Math.min(i+99,total); ranges.push([i,end]); }
      ranges.forEach(r=>{
        const btn = document.createElement("button"); btn.className="range-btn"; btn.textContent=`${r[0]}-${r[1]}`;
        btn.onclick = ()=> renderEpisodes(r[0],r[1]);
        epRanges.appendChild(btn);
      });
      // render first range by default
      renderEpisodes(ranges[0][0], ranges[0][1]);
      titleEl.textContent = series.title + " — Episode " + ep.num + (ep.name?(" • " + ep.name):"");
    }

    function renderEpisodes(start,end){
      epList.innerHTML="";
      const list = series.episodes.filter(e=> e.num>=start && e.num<=end);
      list.forEach(e=>{
        const b = document.createElement("button"); b.className="ep-btn"; b.textContent = e.num + (e.name?(" - "+e.name):"");
        b.onclick = ()=>{ currentEpisode = e; buildPlayerForEpisode(e); };
        epList.appendChild(b);
      });
    }

    // related & most viewed
    related.innerHTML = "<h4>Related & Most Viewed</h4>";
    const rel = DB.series.filter(s=> s.category===series.category && s.id!==series.id).slice(0,4);
    rel.forEach(r=>{ const c = document.createElement("div"); c.className="card"; c.innerHTML = `<strong>${r.title}</strong>`; related.appendChild(c); });

    function autoPlayNext(){
      const idx = series.episodes.findIndex(e=>e.num===currentEpisode.num);
      if(idx>=0 && idx < series.episodes.length-1){
        const next = series.episodes[idx+1];
        currentEpisode = next; buildPlayerForEpisode(next);
        // prefetch next's src
      }
    }

    function attachPlayerGestures(video){
      // double-tap skip: detect double clicks on left/right area
      let lastTap = 0;
      video.addEventListener("click",(ev)=>{
        const now = Date.now();
        if(now - lastTap < 350){
          // double tap: skip 10s forward
          video.currentTime = Math.min(video.duration || 99999, video.currentTime + 10);
          showTempIndicator("+10s");
        }
        lastTap = now;
      });
      // long press fast-forward: while pressed, increase playbackRate
      let holdTimer=null; let holding=false;
      function holdStart(){ holding=true; video.playbackRate = 1.5; showTempIndicator(">>"); }
      function holdEnd(){ holding=false; video.playbackRate = 1.0; }
      video.addEventListener("mousedown", ()=>{ holdStart(); });
      video.addEventListener("mouseup", ()=>{ holdEnd(); });
      video.addEventListener("touchstart", ()=>{ holdStart(); });
      video.addEventListener("touchend", ()=>{ holdEnd(); });

      // pinch zoom for mobile (two fingers)
      let lastDist=null; video.addEventListener("touchmove",(ev)=>{
        if(ev.touches.length===2){
          const dx = ev.touches[0].pageX - ev.touches[1].pageX;
          const dy = ev.touches[0].pageY - ev.touches[1].pageY;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if(lastDist){
            const diff = dist - lastDist;
            const scale = Math.min(2, Math.max(0.8, 1 + diff/400));
            video.style.transform = `scale(${scale})`;
          }
          lastDist = dist;
        }
      });
      video.addEventListener("touchend", ()=>{ lastDist=null; video.style.transform="scale(1)"; });
    }

    buildPlayerForEpisode(currentEpisode);
  } // end player page

})(); // IIFE end
