import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const SITE = 'https://celeb-rumour-wire.pages.dev';
const fallbackStories = [
  { id:'demo-1', celeb:'Celebrity Watch', angle:'Rumour Mill', title:'Live celebrity rumour feed loading...', source:'Celeb Rumour Wire', sourceTier:'Demo', confidence:'Waiting for sources', summary:'The live RSS aggregator is trying to fetch fresh celebrity stories now.', rumourWriteup:'If stories do not appear, check the Cloudflare Functions deployment and the /api/stories endpoint.', sourceUrl:'#', publishedAt:new Date().toUTCString() }
];

const seoPages = {
  '/latest-celebrity-rumours': { title:'Latest Celebrity Rumours Today', desc:'Fresh celebrity rumours, entertainment headlines and trending gossip from source-led feeds.', filter:'' },
  '/celebrity-breakups': { title:'Celebrity Breakups & Relationship Rumours', desc:'Breakup rumours, celebrity relationship news and source-linked drama updates.', filter:'breakup split divorce dating relationship' },
  '/reality-tv-drama': { title:'Reality TV Drama & Gossip', desc:'Reality TV drama, Love Island gossip and trending entertainment stories.', filter:'reality tv love island drama' },
  '/taylor-swift-rumours': { title:'Taylor Swift Rumours & News', desc:'Taylor Swift rumours, entertainment headlines and fan-discussed updates with source links.', filter:'taylor swift' },
  '/kardashian-news': { title:'Kardashian News & Rumours', desc:'Kardashian and Jenner news, gossip and reality TV updates from linked sources.', filter:'kardashian jenner kim khloe kylie kendall kris' }
};

function slugify(text){
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,90);
}

function setMeta({title, desc, path}){
  document.title = `${title} | Celeb Rumour Wire`;
  const descTag = document.querySelector('meta[name="description"]');
  if(descTag) descTag.setAttribute('content', desc);
  const canonical = document.querySelector('link[rel="canonical"]');
  if(canonical) canonical.setAttribute('href', `${SITE}${path || location.pathname}`);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if(ogTitle) ogTitle.setAttribute('content', title);
  if(ogDesc) ogDesc.setAttribute('content', desc);
  if(ogUrl) ogUrl.setAttribute('content', `${SITE}${path || location.pathname}`);
}

function Layout({children,status}){
  return <div className="page">
    <div className="topbar"><marquee>★ HOT CELEB RUMOURS ★ LIVE RSS POWERED ★ SOURCE LINKS ONLY ★ NO CLAIM IS FACT UNTIL CONFIRMED ★</marquee></div>
    <header className="hero">
      <div className="badge">est. 2004-ish</div>
      <h1><a href="/">CELEB RUMOUR WIRE</a></h1>
      <p>Your dial-up drama desk: headlines pulled from entertainment feeds, rewritten into short rumour cards, always linked back to the source.</p>
      <div className="status">{status}</div>
    </header>
    <nav className="nav">
      <a href="/latest-celebrity-rumours">LATEST</a>
      <a href="/celebrity-breakups">BREAKUPS</a>
      <a href="/reality-tv-drama">REALITY TV</a>
      <a href="/taylor-swift-rumours">TAYLOR</a>
      <a href="/kardashian-news">KARDASHIANS</a>
      <a href="/privacy.html">PRIVACY</a>
      <a href="/terms.html">TERMS</a>
    </nav>
    {children}
    <footer>© Celeb Rumour Wire · source-led entertainment commentary · sitemap: <a href="/sitemap.xml">sitemap.xml</a></footer>
  </div>
}

function StoryCard({story}){
  const slug = slugify(story.title || story.id);
  return <article className="card">
    <div className="cardHead"><span>{story.angle}</span><span>{story.confidence}</span></div>
    <h2><a href={`/story/${slug}`}>{story.title}</a></h2>
    <div className="meta">{story.celeb} · {story.source} · {new Date(story.publishedAt).toLocaleString()}</div>
    <p className="summary">{story.summary}</p>
    <div className="writeup"><b>Rumour Wire write-up:</b> {story.rumourWriteup}</div>
    <a className="read" href={story.sourceUrl} target="_blank" rel="noreferrer">Read original source ↗</a>
  </article>
}

function App(){
  const [stories,setStories]=useState(fallbackStories);
  const [status,setStatus]=useState('dialling up the gossip modem...');
  const params = new URLSearchParams(location.search);
  const [query,setQuery]=useState(params.get('q') || '');
  const [angle,setAngle]=useState('All');
  const page = seoPages[location.pathname];

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

  const storyPath = location.pathname.startsWith('/story/') ? location.pathname.split('/story/')[1] : null;
  const selectedStory = storyPath ? stories.find(s=>slugify(s.title)===storyPath) : null;

  useEffect(()=>{
    if(selectedStory){
      setMeta({ title:selectedStory.title, desc:selectedStory.summary, path:location.pathname });
    } else if(page){
      setMeta({ title:page.title, desc:page.desc, path:location.pathname });
    } else {
      setMeta({ title:'Celebrity Rumours, Gossip & Entertainment News', desc:'Latest celebrity rumours, entertainment news, reality TV drama and trending gossip updated daily with source links and short commentary.', path:'/' });
    }
  },[selectedStory,page]);

  const angles=['All',...Array.from(new Set(stories.map(s=>s.angle)))];
  const filtered=useMemo(()=>stories.filter(s=>{
    const q=(page?.filter || query).toLowerCase();
    const hay=`${s.title} ${s.celeb} ${s.summary} ${s.rumourWriteup}`.toLowerCase();
    const matches=!q || q.split(' ').some(term=>hay.includes(term));
    return matches && (angle==='All'||s.angle===angle);
  }),[stories,query,angle,page]);

  if(selectedStory){
    return <Layout status={status}><main className="articlePage">
      <article className="card fullArticle">
        <div className="breadcrumb"><a href="/">Home</a> / <a href="/latest-celebrity-rumours">Latest</a></div>
        <div className="cardHead"><span>{selectedStory.angle}</span><span>{selectedStory.confidence}</span></div>
        <h1>{selectedStory.title}</h1>
        <div className="meta">{selectedStory.celeb} · {selectedStory.source} · {new Date(selectedStory.publishedAt).toLocaleString()}</div>
        <p className="summary big">{selectedStory.summary}</p>
        <div className="writeup"><b>Rumour Wire write-up:</b> {selectedStory.rumourWriteup}</div>
        <p className="disclaimer">This is a source-led summary and commentary page. Treat rumours as unverified unless the linked source or an official party confirms them.</p>
        <a className="read" href={selectedStory.sourceUrl} target="_blank" rel="noreferrer">Read the original source ↗</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          '@context':'https://schema.org','@type':'NewsArticle',headline:selectedStory.title,datePublished:selectedStory.publishedAt,author:{'@type':'Organization',name:'Celeb Rumour Wire'},publisher:{'@type':'Organization',name:'Celeb Rumour Wire'},description:selectedStory.summary,mainEntityOfPage:`${SITE}${location.pathname}`
        })}} />
      </article>
    </main></Layout>
  }

  return <Layout status={status}>
    <main className="layout" id="latest">
      <aside className="sidebar panel">
        <h2>Search the drama</h2>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Taylor, Kardashian, Love Island..." />
        <h2>SEO Channels</h2>
        <a className="sideLink" href="/latest-celebrity-rumours">Latest celebrity rumours</a>
        <a className="sideLink" href="/celebrity-breakups">Celebrity breakups</a>
        <a className="sideLink" href="/reality-tv-drama">Reality TV drama</a>
        <a className="sideLink" href="/taylor-swift-rumours">Taylor Swift rumours</a>
        <a className="sideLink" href="/kardashian-news">Kardashian news</a>
        <h2>Filter</h2>
        {angles.map(a=><button key={a} className={a===angle?'active':''} onClick={()=>setAngle(a)}>{a}</button>)}
        <div className="adbox">YOUR AD HERE<br/>AdSense / affiliate / newsletter</div>
        <p className="small">This site summarises and links to sources. Add your own commentary to maximise Google traffic.</p>
      </aside>
      <section className="feed">
        {page && <div className="panel intro"><h2>{page.title}</h2><p>{page.desc}</p></div>}
        {filtered.map(story=><StoryCard story={story} key={story.id}/>)}
      </section>
    </main>
  </Layout>
}

createRoot(document.getElementById('root')).render(<App/>);
