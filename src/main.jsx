import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Flame, Star, Mail, ExternalLink, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import './styles.css';

const stories = [
  {
    id: 1,
    title: 'Pop star spotted leaving same hotel as mystery collaborator',
    celeb: 'Ariana Grande',
    category: 'Music',
    confidence: 'Rumour',
    tier: 'Unconfirmed',
    summary: 'Fans are speculating after two public sightings in the same area. No representative has confirmed anything, so treat this as chatter rather than fact.',
    commentary: 'Good social-media heat, but weak confirmation. Worth watching for studio photos or official posts.',
    source: 'Public social posts / entertainment chatter',
    url: '#',
    time: '18 min ago',
    trending: 94
  },
  {
    id: 2,
    title: 'Reality TV couple fuel split rumours after unfollowing each other',
    celeb: 'Reality TV',
    category: 'Drama',
    confidence: 'Developing',
    tier: 'Social signal',
    summary: 'A mutual unfollow and deleted photos triggered speculation. There is not yet a verified statement from either side.',
    commentary: 'Unfollows are noisy, but gossip audiences love timeline explainers. Make a careful, neutral post.',
    source: 'Instagram public profile changes',
    url: '#',
    time: '42 min ago',
    trending: 88
  },
  {
    id: 3,
    title: 'Actor linked to new streaming project after casting notice leak',
    celeb: 'Zendaya',
    category: 'TV & Film',
    confidence: 'Likely',
    tier: 'Trade-adjacent',
    summary: 'A casting notice appears to line up with a known production window. This is not official until the studio announces it.',
    commentary: 'This is safer than relationship gossip because it is work-related and easier to verify.',
    source: 'Industry chatter / casting boards',
    url: '#',
    time: '1 hr ago',
    trending: 81
  },
  {
    id: 4,
    title: 'Fashion fans identify designer look from weekend dinner photos',
    celeb: 'Hailey Bieber',
    category: 'Style',
    confidence: 'Confirmed sighting',
    tier: 'Public photos',
    summary: 'The outfit has been matched by several fashion accounts. Affiliate links could work well on this type of story.',
    commentary: 'Style explainers are low-risk and monetisable with affiliate links.',
    source: 'Public paparazzi/fashion posts',
    url: '#',
    time: '2 hrs ago',
    trending: 73
  }
];

const categories = ['All', 'Drama', 'Music', 'TV & Film', 'Style', 'Relationships'];

function App() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => stories.filter(story => {
    const matchesCategory = category === 'All' || story.category === category;
    const text = `${story.title} ${story.celeb} ${story.summary}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase());
  }), [category, query]);

  return <main>
    <header className="hero">
      <nav>
        <div className="logo"><Flame size={24}/> Celeb Rumour Wire</div>
        <a href="#newsletter">Newsletter</a>
      </nav>
      <section className="heroGrid">
        <div>
          <p className="eyebrow">Celebrity news, gossip & explainers</p>
          <h1>The live rumour tracker that separates chatter from confirmation.</h1>
          <p className="sub">Track celebrity rumours, public social signals, entertainment news and style moments with source links, confidence labels and your own commentary.</p>
          <div className="searchBox"><Search size={18}/><input placeholder="Search celebrity, topic or rumour..." value={query} onChange={e => setQuery(e.target.value)} /></div>
        </div>
        <aside className="panel">
          <h2><TrendingUp size={20}/> Trending now</h2>
          {stories.slice(0,3).map(s => <div className="trend" key={s.id}><span>{s.trending}</span><p>{s.title}</p></div>)}
        </aside>
      </section>
    </header>

    <section className="filters">
      {categories.map(c => <button className={category === c ? 'active' : ''} onClick={() => setCategory(c)} key={c}>{c}</button>)}
    </section>

    <section className="layout">
      <div className="feed">
        {filtered.map(story => <article className="card" key={story.id}>
          <div className="meta"><span><Clock size={14}/> {story.time}</span><span>{story.category}</span><span className="confidence">{story.confidence}</span></div>
          <h2>{story.title}</h2>
          <p>{story.summary}</p>
          <blockquote>{story.commentary}</blockquote>
          <div className="footer"><span><ShieldCheck size={15}/> {story.tier}</span><a href={story.url}>Source link <ExternalLink size={14}/></a></div>
        </article>)}
      </div>

      <aside className="sidebar">
        <div className="adbox">Ad placeholder<br/><small>Replace with AdSense after approval</small></div>
        <div className="box">
          <h3><Star size={18}/> Editorial rules</h3>
          <ul>
            <li>Never state rumours as facts.</li>
            <li>Link to the original source.</li>
            <li>Add your own summary/commentary.</li>
            <li>Avoid private, doxxing or defamatory claims.</li>
          </ul>
        </div>
        <div className="box" id="newsletter">
          <h3><Mail size={18}/> Daily gossip email</h3>
          <p>Collect emails later with Mailchimp, Beehiiv or ConvertKit.</p>
          <input placeholder="email@example.com" />
          <button>Join waitlist</button>
        </div>
      </aside>
    </section>

    <footer>
      <p>© Celeb Rumour Wire. Entertainment commentary and curated links. Rumours are labelled clearly and should not be treated as verified facts unless marked confirmed.</p>
      <p><a href="/privacy.html">Privacy Policy</a> · <a href="/terms.html">Terms</a></p>
    </footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
