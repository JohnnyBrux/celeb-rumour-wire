import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
function decodeHtml(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text || "";
  return textarea.value;
}
const fallbackStories = [
  { id:'demo-1', celeb:'Celebrity Watch', angle:'Rumour Mill', title:'Live feed loading...', source:'Celeb Rumour Wire', sourceTier:'Demo', confidence:'Waiting for sources', summary:'The live RSS aggregator is trying to fetch fresh celebrity stories now.', rumourWriteup:'If stories do not appear, check the Cloudflare Functions deployment and the /api/stories endpoint.', sourceUrl:'#', publishedAt:new Date().toUTCString() }
];

function App(){
  const [stories,setStories]=useState(fallbackStories);
  const [status,setStatus]=useState('dialling up the gossip modem...');
  const [query,setQuery]=useState('');
  const [angle,setAngle]=useState('All');

  useEffect(()=>{
    async function load(){
      try{
        const res=await fetch('/api/stories');
        const data=await res.json();
        if(data.stories?.length){ setStories(data.stories); setStatus(`live: ${data.count} stories scanned`); }
        else setStatus('no stories returned yet');
      }catch(e){ setStatus('offline/demo mode - API not responding'); }
    }
    load(); const t=setInterval(load, 5*60*1000); return()=>clearInterval(t);
  },[]);
  const angles=['All',...Array.from(new Set(stories.map(s=>s.angle)))];
  const filtered=useMemo(()=>stories.filter(s=>{
    const q=query.toLowerCase();
    const matches = !q || `${decodeHtml(s.title)} ${decodeHtml(s.celeb)} ${decodeHtml(s.summary)}`.toLowerCase().includes(q);
    return matches && (angle==='All'||s.angle===angle);
  }),[stories,query,angle]);
  return <div className="page">
    <div className="topbar"><marquee>★ HOT CELEB RUMOURS ★ LIVE RSS POWERED ★ SOURCE LINKS ONLY ★ NO CLAIM IS FACT UNTIL CONFIRMED ★</marquee></div>
    <header className="hero">
      <div className="badge">est. 2004-ish</div>
      <h1>CELEB RUMOUR WIRE</h1>
      <p>Your dial-up drama desk: headlines pulled from entertainment feeds, rewritten into short rumour cards, always linked back to the source.</p>
      <div className="status">{status}</div>
    </header>
    <nav className="nav"><a href="#latest">LATEST</a><a href="/privacy.html">PRIVACY</a><a href="/terms.html">TERMS</a><a href="mailto:tips@example.com">SEND TIP</a></nav>
    <main className="layout" id="latest">
      <aside className="sidebar panel">
        <h2>Search the drama</h2>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Taylor, Kardashian, Love Island..." />
        <h2>Channels</h2>
        {angles.map(a=><button key={a} className={a===angle?'active':''} onClick={()=>setAngle(a)}>{a}</button>)}
        <div className="adbox">YOUR AD HERE<br/>728x90 / affiliate / newsletter</div>
        <p className="small">This site summarises/link-posts. It does not claim gossip is verified unless the source says so.</p>
      </aside>
      <section className="feed">
        {filtered.map(story=><article className="card" key={story.id}>
          <div className="cardHead"><span>{story.angle}</span><span>{story.confidence}</span></div>
          <h2>{decodeHtml(story.title)}</h2>
          <div className="meta">{decodeHtml(story.celeb)} · {story.source} · {new Date(story.publishedAt).toLocaleString()}</div>
          <p className="summary">{decodeHtml(story.summary)}</p>
          <div className="writeup"><b>Rumour Wire write-up:</b> {decodeHtml(story.rumourWriteup)}</div>
          <a className="read" href={story.sourceUrl} target="_blank" rel="noreferrer">Read original source ↗</a>
        </article>)}
      </section>
    </main>
    <footer>© Celeb Rumour Wire · built for Cloudflare Pages · refreshes every 5 minutes</footer>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
