import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const stories = [
  {
    id: 1,
    title: 'Pop star spotted leaving same hotel as mystery collaborator',
    celeb: 'Ariana Grande',
    category: 'Music',
    confidence: 'RUMOUR',
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
    confidence: 'DEVELOPING',
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
    confidence: 'LIKELY',
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
    confidence: 'CONFIRMED SIGHTING',
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
    <div className="topbar">
      <span>★ CELEB RUMOUR WIRE ★</span>
      <span>Best viewed on broadband · Updated every 15 mins · Add us to your bookmarks!</span>
    </div>

    <header className="masthead">
      <div className="badge">EXCLUSIVE-ish</div>
      <h1>Celeb Rumour Wire</h1>
      <p className="tagline">Your messy little corner of celebrity gossip, links, chatter & pop culture drama.</p>
      <marquee>🔥 HOT TODAY: split rumours • mystery collaborators • red carpet shade • outfit IDs • source checks • reality TV chaos 🔥</marquee>
    </header>

    <nav className="nav2000">
      <a href="#">Home</a>
      <a href="#">Drama</a>
      <a href="#">Music</a>
      <a href="#">Style</a>
      <a href="#newsletter">Newsletter</a>
      <a href="/privacy.html">Privacy</a>
    </nav>

    <section className="searchStrip">
      <b>Search the gossip archive:</b>
      <input placeholder="celebrity, rumour, topic..." value={query} onChange={e => setQuery(e.target.value)} />
    </section>

    <section className="pageTable">
      <aside className="leftCol">
        <div className="box2000">
          <h3>Channels</h3>
          {categories.map(c => <button className={category === c ? 'active' : ''} onClick={() => setCategory(c)} key={c}>{c}</button>)}
        </div>
        <div className="box2000 poll">
          <h3>Site Poll</h3>
          <p>Who is causing the most chaos this week?</p>
          <label><input type="radio" name="poll" /> Reality TV couples</label>
          <label><input type="radio" name="poll" /> Pop stars</label>
          <label><input type="radio" name="poll" /> Nepo babies</label>
          <button>Vote!</button>
        </div>
        <div className="counter">Visitors: 0001337</div>
      </aside>

      <section className="feed">
        <div className="breaking">BREAKING / DEVELOPING / POSSIBLY NOTHING</div>
        {filtered.map(story => <article className="post" key={story.id}>
          <div className="postHead">
            <span>{story.time}</span>
            <span>{story.category}</span>
            <strong>{story.confidence}</strong>
          </div>
          <h2>{story.title}</h2>
          <p>{story.summary}</p>
          <blockquote>{story.commentary}</blockquote>
          <div className="sourceRow">
            <span>Source tier: <b>{story.tier}</b></span>
            <a href={story.url}>Original link »</a>
          </div>
        </article>)}
      </section>

      <aside className="rightCol">
        <div className="adbox">468x60 AD SPACE<br/><small>AdSense later</small></div>
        <div className="box2000">
          <h3>Trending Meter</h3>
          {stories.slice(0,3).map(s => <div className="meter" key={s.id}><span>{s.trending}%</span><p>{s.title}</p></div>)}
        </div>
        <div className="box2000" id="newsletter">
          <h3>Join the Email Blast</h3>
          <p>Daily drama direct to your inbox.</p>
          <input placeholder="email@example.com" />
          <button>Subscribe</button>
        </div>
        <div className="box2000 tiny">
          <h3>Rules</h3>
          <p>Rumours are labelled clearly. We link sources and add commentary. We do not present gossip as confirmed fact.</p>
        </div>
      </aside>
    </section>

    <footer>
      <p>© Celeb Rumour Wire · Entertainment commentary & curated links · <a href="/terms.html">Terms</a> · <a href="/privacy.html">Privacy</a></p>
    </footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
