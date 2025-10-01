
// DejandoHuella - EN VIVO (drop-in)
(function(){
  const liveEls = {
    sym:  document.getElementById('lv-symbol'),
    side: document.getElementById('lv-side'),
    price:document.getElementById('lv-price'),
    lots: document.getElementById('lv-lots'),
    sltp: document.getElementById('lv-sltp'),
    ts:   document.getElementById('lv-ts'),
    img:  document.getElementById('lv-shot'),
    hist: document.getElementById('hist-body')
  };

  function badgeHTML(text){
    const t = (text||'').toUpperCase();
    const cls = t==='BUY'?'bg-green-600':'bg-red-600';
    return '<span class=\"badge '+cls+'\">'+t+'</span>';
  }

  function safeJson(txt){
    try{ return JSON.parse(txt); }catch(_){ return null; }
  }

  function nice(n, dp){
    if(n===undefined || n===null || n==='') return '—';
    const x = Number(n); if(Number.isNaN(x)) return '—';
    return dp===undefined ? x.toString() : x.toFixed(dp);
  }

  function localTs(ts){
    if(ts===undefined || ts===null || ts==='') return '—';
    if(typeof ts==='number'){
      const ms = ts<1e12 ? ts*1000 : ts;
      return new Date(ms).toLocaleString();
    }
    const t = String(ts).replace(/\./g,'-').replace(' ','T');
    const d = new Date(t);
    return Number.isNaN(+d) ? String(ts) : d.toLocaleString();
  }

  function refreshImage(){
    if(!liveEls.img) return;
    const base = (liveEls.img.getAttribute('data-base') || liveEls.img.src.split('?')[0] || '/live/shots/latest.png');
    liveEls.img.setAttribute('data-base', base);
    liveEls.img.src = base + (base.includes('?')?'&':'?') + 'ts=' + Date.now();
  }
  window.DH_refreshImage = refreshImage;

  async function pollLast(){
    if(!liveEls.sym) return;
    try{
      const r   = await fetch('/live/last.json?ts='+Date.now(), {cache:'no-store'});
      const txt = await r.text();
      const d   = safeJson(txt);
      if(d){
        const sym  = (d.symbol && d.symbol!==0) ? String(d.symbol) : 'BTCUSD';
        const side = d.side || '—';
        liveEls.sym.textContent    = sym;
        liveEls.side.innerHTML     = badgeHTML(side);
        liveEls.price.textContent  = nice(d.price);
        liveEls.lots.textContent   = nice(d.lots,2);
        liveEls.sltp.textContent   = nice(d.sl) + ' / ' + nice(d.tp);
        liveEls.ts.textContent     = localTs(d.ts);
        refreshImage();
      }
    }catch(_){ /* silent */ }
    setTimeout(pollLast, 2500);
  }

  async function pollTrades(){
    if(!liveEls.hist) return;
    try{
      const r   = await fetch('/live/trades.jsonl?ts='+Date.now(), {cache:'no-store'});
      const txt = await r.text();
      const lines = txt.trim().split(/\r?\n/).filter(Boolean).slice(-20).reverse();
      const rows = [];
      for(const ln of lines){
        const d = safeJson(ln); if(!d) continue;
        const sym  = (d.symbol && d.symbol!==0) ? String(d.symbol) : 'BTCUSD';
        const side = d.side || '';
        rows.push(
          '<tr>' +
            '<td>'+ localTs(d.ts) +'</td>' +
            '<td>'+ sym +'</td>' +
            '<td>'+ badgeHTML(side) +'</td>' +
            '<td>'+ nice(d.price) +'</td>' +
            '<td>'+ nice(d.lots,2) +'</td>' +
            '<td>'+ nice(d.sl) +'</td>' +
            '<td>'+ nice(d.tp) +'</td>' +
          '</tr>'
        );
      }
      liveEls.hist.innerHTML = rows.join('') || '<tr><td colspan=\"7\">Sin operaciones aún...</td></tr>';
    }catch(_){
      liveEls.hist.innerHTML = '<tr><td colspan=\"7\">Sin operaciones aún...</td></tr>';
    }
    setTimeout(pollTrades, 5000);
  }

  // Kick-off
  pollLast();
  pollTrades();
  setInterval(refreshImage, 2500);
})();
