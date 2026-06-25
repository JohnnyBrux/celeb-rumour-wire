import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Star, Flame, Mail, Lock, Eye, Edit3, CheckCircle, Trash2 } from 'lucide-react';
import './styles.css';
import { initialStories } from './data.js';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getPath() {
  return window.location.hash.replace('#', '') || window.location.pathname;
}

function navigate(path) {
  window.history.pushState(null, '', '#' + path);
  window.dispatchEvent(new Event('locationchange'));
}

function Layout({ children }) {
  return <div className="site">
    <div className="topbar">★ CELEB RUMOUR WIRE ★ HOT GOSSIP ★ REAL SOURCES ★ RETRO MODE ★</div>
    <header className="header">
      <button className="logoButton" onClick={() => navigate('/')}>Celeb Rumour Wire</button>
      <p>Early-2000s gossip energy. Source-led summaries. Rumours clearly labelled.</p>
      <nav>
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/trending')}>Trending</button>
        <button onClick={() => navigate('/admin')}>Admin</button>
        <a href="/privacy.html">Privacy</a>
      </nav>
    </header>
    {children}
    <footer className="footer">© Celeb Rumour Wire · Gossip is for entertainment · Link back to sources.</footer>
  </div>
}

function StoryCard({ story }) {
  return <article className="storyCard" onClick={() => navigate('/story/' + (story.slug || slugify(story.title)))}>
    <div className="badge">{story.category}</div>
    <h2>{story.title}</h2>
    <p className="meta">{story.celeb} · {story.confidence} · {new Date(story.publishedAt).toLocaleString()}</p>
    <p>{story.summary}</p>
    <div className="readMore">READ STORY →</div>
  </article>
}

function Home({ stories }) {
  const [query, setQuery] = useState('');
  const filtered = stories.filter(s => `${s.title} ${s.celeb} ${s.category}`.toLowerCase().includes(query.toLowerCase()));
  const featured = filtered.find(s => s.featured) || filtered[0];
  const sections = ['Celebrity Breakups', 'Reality TV Drama', 'Music Gossip'];
  return <Layout>
    <main className="grid">
      <section className="mainColumn">
        <div className="searchBox"><Search size={18}/><input placeholder="Search rumours, celebs, topics..." value={query} onChange={e => setQuery(e.target.value)} /></div>
        {featured && <div className="breaking"><Flame/> BREAKING RUMOUR<br/><span>{featured.title}</span></div>}
        <h1>Latest Celebrity Rumours</h1>
        <div className="cards">{filtered.map(story => <StoryCard key={story.id} story={story}/>)}</div>
        {sections.map(section => <section key={section}><h1>{section}</h1><div className="cards">{stories.filter(s => s.category === section).map(story => <StoryCard key={story.id + section} story={story}/>)}</div></section>)}
      </section>
      <aside className="sideColumn">
        <div className="box"><h3><Star/> Trending Celebs</h3><p>Taylor Swift</p><p>Love Island</p><p>Kardashians</p><p>Harry Styles</p></div>
        <div className="box ad">AD SPACE<br/>728x90 / 300x250</div>
        <div className="box"><h3><Mail/> Daily Gossip Blast</h3><p>Newsletter placeholder. Connect Mailchimp/Beehiiv later.</p><input placeholder="email@example.com"/><button>Join</button></div>
      </aside>
    </main>
  </Layout>
}

function StoryPage({ stories, slug }) {
  const story = stories.find(s => s.slug === slug || s.id === slug);
  if (!story) return <Layout><main className="mainColumn"><h1>Story not found</h1><button onClick={() => navigate('/')}>Back home</button></main></Layout>;
  const related = stories.filter(s => s.id !== story.id && (s.category === story.category || s.celeb === story.celeb)).slice(0, 3);
  return <Layout><main className="articlePage">
    <div className="badge">{story.category}</div>
    <h1>{story.title}</h1>
    <p className="meta">{story.celeb} · {story.confidence} · {new Date(story.publishedAt).toLocaleString()}</p>
    <p className="standfirst">{story.summary}</p>
    <div className="articleBody"><p>{story.body}</p></div>
    <a className="sourceLink" href={story.sourceUrl} target="_blank" rel="noreferrer">Original source: {story.source}</a>
    <h2>Related Rumours</h2>
    <div className="cards">{related.map(r => <StoryCard key={r.id} story={r}/>)}</div>
  </main></Layout>
}

function Trending({ stories }) {
  return <Layout><main className="mainColumn"><h1>Trending Today</h1>{stories.map(story => <StoryCard key={story.id} story={story}/>)}</main></Layout>
}

function Admin({ stories, setStories }) {
  const [form, setForm] = useState({ title:'', celeb:'', category:'Reality TV Drama', summary:'', body:'', source:'Manual', sourceUrl:'#', confidence:'Draft' });
  function addStory(e) {
    e.preventDefault();
    const newStory = { ...form, id: slugify(form.title), slug: slugify(form.title), publishedAt: new Date().toISOString(), featured: false };
    setStories([newStory, ...stories]);
    setForm({ title:'', celeb:'', category:'Reality TV Drama', summary:'', body:'', source:'Manual', sourceUrl:'#', confidence:'Draft' });
  }
  function deleteStory(id) { setStories(stories.filter(s => s.id !== id)); }
  return <Layout><main className="adminGrid">
    <section className="adminPanel"><h1><Lock/> Admin Dashboard</h1><p>This is Phase 1 local admin. Next phase connects this to Supabase login/database.</p>
      <form onSubmit={addStory} className="adminForm">
        <input placeholder="Headline" value={form.title} onChange={e => setForm({...form,title:e.target.value})} required />
        <input placeholder="Celeb/topic" value={form.celeb} onChange={e => setForm({...form,celeb:e.target.value})} />
        <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}><option>Reality TV Drama</option><option>Celebrity Breakups</option><option>Music Gossip</option><option>Hollywood</option></select>
        <textarea placeholder="Short summary" value={form.summary} onChange={e => setForm({...form,summary:e.target.value})}></textarea>
        <textarea placeholder="Full Rumour Wire write-up" value={form.body} onChange={e => setForm({...form,body:e.target.value})}></textarea>
        <input placeholder="Original source URL" value={form.sourceUrl} onChange={e => setForm({...form,sourceUrl:e.target.value})} />
        <button><CheckCircle size={16}/> Add Story</button>
      </form>
    </section>
    <section className="adminPanel"><h2><Eye/> Current Stories</h2>{stories.map(s => <div className="adminStory" key={s.id}><b>{s.title}</b><span>{s.category}</span><button onClick={() => navigate('/story/' + s.slug)}><Edit3 size={14}/> View</button><button onClick={() => deleteStory(s.id)}><Trash2 size={14}/> Delete</button></div>)}</section>
  </main></Layout>
}

function App() {
  const [path, setPath] = useState(getPath());
  const [stories, setStories] = useState(() => JSON.parse(localStorage.getItem('crw_stories') || 'null') || initialStories);
  React.useEffect(() => {
    const update = () => setPath(getPath());
    window.addEventListener('popstate', update); window.addEventListener('locationchange', update);
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('locationchange', update); };
  }, []);
  React.useEffect(() => localStorage.setItem('crw_stories', JSON.stringify(stories)), [stories]);
  if (path.startsWith('/story/')) return <StoryPage stories={stories} slug={path.replace('/story/', '')} />;
  if (path === '/admin') return <Admin stories={stories} setStories={setStories} />;
  if (path === '/trending') return <Trending stories={stories} />;
  return <Home stories={stories} />;
}

createRoot(document.getElementById('root')).render(<App />);
