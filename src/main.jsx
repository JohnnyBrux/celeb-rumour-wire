import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function decodeHtml(text){ const textarea = document.createElement('textarea'); textarea.innerHTML = text || ''; return textarea.value; }
function slugify(s='story'){ return decodeHtml(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,90) || 'story'; }
function fmtDate(d){ try { return new Date(d).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); } catch { return ''; } }
function host(){ return window.location.origin; }

const fallbackStories=[
  {id:'demo-1',slug:'live-celebrity-rumour-wire-loading',title:'Live celebrity rumour wire loading...',celeb:'Celebrity Watch',angle:'Breaking Rumours',summary:'The RSS wire is warming up. If this message stays here, check the Cloudflare Pages Functions deployment.',source:'Celeb Rumour Wire',sourceTier:'Demo',confidence:'Waiting for sources',publishedAt:new Date().toISOString(),sourceUrl:'#',rumourWriteup:'Once sources load, this area becomes an original short write-up based on the linked publisher report.'}
];

const sectionDefs=[
  {key:'breaking',label:'🔥 Breaking Rumours',path:'/breaking-rumours',filter:/breaking|exclusive|rumour|report|claim|source|insider|spotted|seen|secret/i},
  {key:'trending',label:'⭐ Trending Celebs',path:'/trending',filter:null},
  {key:'breakups',label:'💔 Celebrity Breakups',path:'/celebrity-breakups',filter:/split|breakup|divorce|dating|relationship|romance|couple|ex|married|wedding/i},
  {key:'reality',label:'📺 Reality TV Drama',path:'/reality-tv-drama',filter:/love island|reality|kardashian|housewives|bachelor|traitors|big brother|mafs/i},
  {key:'music',label:'🎵 Music Gossip',path:'/music-rumours',filter:/swift|beyonc|rihanna|sabrina|selena|harry styles|album|tour|concert|music|singer|rapper/i},
  {key:'screen',label:'🎬 Movie & TV Buzz',path:'/movie-tv-buzz',filter:/movie|trailer|netflix|hbo|disney|series|season|actor|actress|cast|film/i}
];

const topicPages=Object.fromEntries(sectionDefs.map(s=>[s.path,{title:s.label.replace(/[🔥⭐💔📺🎵🎬]/g,'').trim(),desc:`Latest ${s.label.toLowerCase()} from linked entertainment sources, rewritten as short Rumour Wire cards.`,filter:s.filter}]));

topicPages['/trending']={title:'Trending Celebrity Rumours Today',desc:'The hottest celebrity gossip and entertainment headlines currently moving across the wire.',filter:null};

function updateMeta(title,desc,canonical){
  document.title = title;
  const ensure=(selector,type,key)=>{ let el=document.querySelector(selector); if(!el){ el=document.createElement('meta'); el.setAttribute(type,key); document.head.appendChild(el);} return el; };
  ensure('meta[name="description"]','name','description').setAttribute('content',desc);
  ensure('meta[property="og:title"]','property','og:title').setAttribute('content',title);
  ensure('meta[property="og:description"]','property','og:description').setAttribute('content',desc);
  ensure('meta[property="og:url"]','property','og:url').setAttribute('content',canonical);
  ensure('meta[name="twitter:title"]','name','twitter:title').setAttribute('content',title);
  ensure('meta[name="twitter:description"]','name','twitter:description').setAttribute('content',desc);
  let link=document.querySelector('link[rel="canonical"]'); if(!link){ link=document.createElement('link'); link.rel='canonical'; document.head.appendChild(link);} link.href=canonical;
}

function storyMatches(story,rx){ if(!rx) return true; const hay=`${decodeHtml(story.title)} ${decodeHtml(story.summary)} ${decodeHtml(story.rumourWriteup)} ${story.angle} ${story.celeb}`; return rx.test(hay); }
function sectionStories(stories,def,count=4){ return stories.filter(s=>storyMatches(s,def.filter)).slice(0,count); }

function App(){
  const [stories,setStories]=useState(fallbackStories);
  const [status,setStatus]=useState('dialling up the gossip modem...');
  const [query,setQuery]=useState('');
  const [angle,setAngle]=useState('All');
  const [lastUpdated,setLastUpdated]=useState(new Date());

  useEffect(()=>{ async function load(){ try{ const res=await fetch('/api/stories'); const data=await res.json(); if(data.stories?.length){ setStories(data.stories.map(s=>({...s, slug:s.slug || slugify(s.title)}))); setStatus(`live: ${data.count || data.stories.length} stories scanned`); setLastUpdated(new Date()); } else setStatus('no stories returned yet'); } catch(e){ setStatus('offline/demo mode — API not responding'); } } load(); const t=setInterval(load,15*60*1000); return()=>clearInterval(t); },[]);

  const path=window.location.pathname.replace(/\/$/,'') || '/';
  const articleSlug=path.startsWith('/story/') ? path.replace('/story/','') : null;
  const page=topicPages[path];
  const article=articleSlug ? stories.find(s=>(s.slug||slugify(s.title))===articleSlug) : null;

  useEffect(()=>{ if(article){ updateMeta(`${decodeHtml(article.title)} | Celeb Rumour Wire`, `Source-led rumour card based on ${article.source}: ${decodeHtml(article.summary).slice(0,140)}`, location.href); } else if(page){ updateMeta(`${page.title} | Celeb Rumour Wire`, page.desc, location.href); } else updateMeta('Celebrity Rumours, Gossip & Entertainment News | Celeb Rumour Wire','Latest celebrity rumours, entertainment news, reality TV drama and trending gossip updated automatically from linked sources.',host()+'/'); },[article,page]);

  const angles=['All',...Array.from(new Set(stories.map(s=>s.angle).filter(Boolean)))];
  const filtered=useMemo(()=>stories.filter(s=>{ const q=query.toLowerCase(); const hay=`${decodeHtml(s.title)} ${decodeHtml(s.summary)} ${decodeHtml(s.source)} ${s.angle}`.toLowerCase(); const matchQ=!q||hay.includes(q); const matchA=angle==='All'||s.angle===angle; const matchPage=!page?.filter||page.filter.test(hay); return matchQ&&matchA&&matchPage; }),[stories,query,angle,page]);
  const trending=stories.slice(0,8);

  if(article) return <Shell status={status} lastUpdated={lastUpdated}><Article story={article} related={stories.filter(s=>s.id!==article.id).filter(s=>s.angle===article.angle || s.celeb===article.celeb).slice(0,4)}/><Sidebar stories={trending} query={query} setQuery={setQuery}/></Shell>;

  if(page) return <Shell status={status} lastUpdated={lastUpdated}><section className="feed"><h1>{page.title}</h1><p className="deck">{page.desc}</p>{filtered.map(story=><StoryCard key={story.id} story={story}/>)}</section><Sidebar stories={trending} query={query} setQuery={setQuery} angle={angle} setAngle={setAngle} angles={angles}/></Shell>;

  return <Shell status={status} lastUpdated={lastUpdated}>
    <section className="feed">
      <h1>Latest Celebrity Rumours & Entertainment News</h1>
      <p className="deck">Source-led gossip cards with original short write-ups, clickable story pages, related articles and retro 2000s chaos. We link back and avoid stating gossip as fact unless it is confirmed.</p>
      <div className="front-grid">
        {sectionDefs.map(def=> <FrontSection key={def.key} def={def} stories={sectionStories(stories,def,3)} />)}
      </div>
      <h2 className="sectionTitle">📰 Full Live Feed</h2>
      {filtered.map(story=><StoryCard key={story.id} story={story}/>)}</section>
    <Sidebar stories={trending} query={query} setQuery={setQuery} angle={angle} setAngle={setAngle} angles={angles}/>
  </Shell>;
}

function Shell({children,status,lastUpdated}){ return <div className="page"><div className="topbar"><marquee>★ HOT CELEB RUMOURS ★ LIVE RSS POWERED ★ CLICK STORIES FOR FULL WIRE PAGES ★ NO CLAIM IS FACT UNTIL CONFIRMED ★</marquee></div><header className="hero"><div className="badge">est. 2004-ish</div><h1><a href="/">CELEB RUMOUR WIRE</a></h1><p>Your dial-up drama desk: entertainment feeds, original short write-ups, source links and SEO pages.</p><div className="status">{status} · last refresh {fmtDate(lastUpdated)}</div></header><nav className="nav"><a href="/">LATEST</a>{sectionDefs.map(s=><a key={s.path} href={s.path}>{s.label.replace(/^[^A-Z]+/,'')}</a>)}<a href="/privacy.html">PRIVACY</a><a href="/terms.html">TERMS</a></nav><main className="layout">{children}</main><footer>© Celeb Rumour Wire · built for Cloudflare Pages · refreshes every 15 minutes · source-led commentary only</footer></div> }

function FrontSection({def,stories}){ return <section className="mini panel"><h2><a href={def.path}>{def.label}</a></h2>{stories.length?stories.map(story=><a className="miniStory" key={story.id} href={`/story/${story.slug||slugify(story.title)}`}><b>{decodeHtml(story.title)}</b><span>{decodeHtml(story.source)} · {fmtDate(story.publishedAt)}</span></a>):<p>No stories in this channel yet.</p>}<a className="more" href={def.path}>More {def.label} →</a></section> }

function StoryCard({story}){ const slug=story.slug||slugify(story.title); return <article className="card" onClick={(e)=>{ if(e.target.tagName.toLowerCase()!=='a') window.location.href=`/story/${slug}` }}><div className="cardHead"><span>{story.angle}</span><span>{story.confidence}</span></div><h2><a href={`/story/${slug}`}>{decodeHtml(story.title)}</a></h2><div className="meta">{decodeHtml(story.source)} · {story.sourceTier} · {fmtDate(story.publishedAt)}</div><p className="summary">{decodeHtml(story.summary)}</p><div className="writeup"><b>Rumour Wire write-up:</b> {decodeHtml(story.rumourWriteup)}</div><div className="cardLinks"><a className="read" href={`/story/${slug}`}>Open full wire page →</a><a className="read source" href={story.sourceUrl} target="_blank" rel="noreferrer">Original source ↗</a></div></article> }

function Article({story,related}){ const schema={ '@context':'https://schema.org','@type':'NewsArticle',headline:decodeHtml(story.title),description:decodeHtml(story.summary),datePublished:story.publishedAt,author:{'@type':'Organization',name:'Celeb Rumour Wire'},publisher:{'@type':'Organization',name:'Celeb Rumour Wire'},mainEntityOfPage:location.href }; return <section className="article panel"><script type="application/ld+json">{JSON.stringify(schema)}</script><p className="crumb"><a href="/">Latest</a> / <a href={sectionDefs.find(d=>storyMatches(story,d.filter))?.path || '/trending'}>{story.angle}</a></p><h1>{decodeHtml(story.title)}</h1><div className="meta">{decodeHtml(story.source)} · {story.sourceTier} · {fmtDate(story.publishedAt)}</div><h2>What happened?</h2><p>{decodeHtml(story.summary)}</p><h2>Why people are talking</h2><p>{decodeHtml(story.rumourWriteup)}</p><h2>Rumour Wire take</h2><p>This is a source-led entertainment item. Treat it as unconfirmed chatter unless the linked publisher, celebrity representative or official account confirms it.</p><a className="read big" href={story.sourceUrl} target="_blank" rel="noreferrer">Read the original report ↗</a>{related.length>0&&<div className="related"><h2>Related drama</h2>{related.map(s=><a key={s.id} href={`/story/${s.slug||slugify(s.title)}`}>{decodeHtml(s.title)}</a>)}</div>}</section> }

function Sidebar({stories,query,setQuery,angle,setAngle,angles=[]}){ return <aside className="sidebar panel"><h2>Search the drama</h2><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Taylor, Kardashian, Love Island..."/>{angles.length>0&&<><h2>Channels</h2>{angles.map(a=><button key={a} className={a===angle?'active':''} onClick={()=>setAngle(a)}>{a}</button>)}</>}<h2>Trending now</h2>{stories.map(s=><p key={s.id}><a href={`/story/${s.slug||slugify(s.title)}`}>{decodeHtml(s.title)}</a></p>)}<AdBox/><Newsletter/></aside> }
function AdBox(){ return <div className="ad">AD HERE<br/>728x90 / affiliate / newsletter sponsor</div> }
function Newsletter(){ return <div className="newsletter"><h2>Daily gossip email</h2><p>Placeholder for Mailchimp/Beehiiv signup.</p><input placeholder="email@example.com"/><button>Subscribe</button></div> }

createRoot(document.getElementById('root')).render(<App/>);
