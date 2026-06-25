const FEEDS = [
  { name: 'Entertainment Tonight', url: 'https://www.etonline.com/news/rss', topic: 'entertainment' },
  { name: 'Variety', url: 'https://variety.com/feed/', topic: 'hollywood' },
  { name: 'People', url: 'https://people.com/feed/', topic: 'celebrity' },
  { name: 'E! Online', url: 'https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml', topic: 'celebrity' }
];

function stripTags(s=''){return s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function decode(s=''){return s.replace(/<!\[CDATA\[(.*?)\]\]>/gs,'$1').replace(/&#8216;/g,'‘').replace(/&#8217;/g,'’').replace(/&#8220;/g,'“').replace(/&#8221;/g,'”').replace(/&amp;/g,'&').replace(/&quot;/g,'"')}
function tag(xml, name){const m=xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return decode(stripTags(m?.[1]||''))}
function slugify(s){return (s||'story').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)}
function celebFrom(title){const known=['Taylor Swift','Kim Kardashian','Kylie Jenner','Selena Gomez','Beyoncé','Ariana Grande','Harry Styles','Justin Bieber','Rihanna','Kanye West','Travis Kelce','Love Island','Kardashian'];return known.find(k=>title.toLowerCase().includes(k.toLowerCase()))||'Celebrity News'}
function angle(title){const t=title.toLowerCase(); if(t.includes('split')||t.includes('breakup')||t.includes('divorce')) return 'Breakups'; if(t.includes('love island')||t.includes('reality')) return 'Reality TV'; if(t.includes('album')||t.includes('song')||t.includes('tour')) return 'Music'; if(t.includes('red carpet')||t.includes('style')) return 'Fashion'; return 'Celebrity Rumours'}
function writeup(title, source){return `Rumour Wire write-up: According to ${source}, this story is making noise online. Treat it as a source-led update rather than confirmed gossip unless the people involved have commented directly.`}

export async function onRequestGet() {
  const stories = [];
  await Promise.all(FEEDS.map(async feed => {
    try {
      const res = await fetch(feed.url, { headers: { 'user-agent': 'CelebRumourWire/1.0' } });
      const xml = await res.text();
      const items = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
      for (const item of items.slice(0,8)) {
        const title = tag(item,'title');
        const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || item.match(/<link[^>]*href=["']([^"']+)/i);
        const sourceUrl = decode(stripTags(linkMatch?.[1]||''));
        const summary = tag(item,'description') || tag(item,'summary') || 'Click through to read the full source report.';
        const publishedAt = tag(item,'pubDate') || tag(item,'updated') || new Date().toISOString();
        if(title) stories.push({
          id: slugify(title), slug: slugify(title), title, celeb: celebFrom(title), angle: angle(title),
          summary: summary.slice(0,240), rumourWriteup: writeup(title, feed.name), source: feed.name, sourceUrl,
          publishedAt: new Date(publishedAt).toISOString(), confidence: 'Source-led', topic: feed.topic
        });
      }
    } catch(e) {}
  }));
  stories.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
  return Response.json({ stories: stories.slice(0,30), updatedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'public, max-age=900' }});
}
