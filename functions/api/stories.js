const FEEDS = [
  { name: 'Variety', url: 'https://variety.com/feed/', tier: 'Publisher' },
  { name: 'Entertainment Weekly', url: 'https://ew.com/feed/', tier: 'Publisher' },
  { name: 'People', url: 'https://people.com/feed/', tier: 'Publisher' },
  { name: 'TMZ', url: 'https://www.tmz.com/rss.xml', tier: 'Tabloid' },
  { name: 'E! Online', url: 'https://www.eonline.com/news/rss', tier: 'Publisher' }
];
const TOPICS = [
  ['Reality TV', /love island|real housewives|kardashian|bachelor|traitors|reality/i],
  ['Music', /swift|beyonc|rihanna|sabrina|selena|harry styles|album|tour|concert/i],
  ['Breakups', /split|breakup|divorce|dating|relationship|romance|couple/i],
  ['Movie & TV', /movie|trailer|netflix|hbo|disney|series|season|actor|actress/i]
];
function stripTags(s=''){ return s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(); }
function decode(s=''){ return s.replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>'); }
function slugify(s='story'){ return decode(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,90) || 'story'; }
function pickAngle(title, summary){ const text = `${title} ${summary}`; return (TOPICS.find(([,rx])=>rx.test(text))||['Celebrity Watch'])[0]; }
function writeup(story){
  const title = decode(story.title);
  return `${story.angle}: ${story.source} has a fresh entertainment update. We are treating this as source-led chatter unless an official confirmation follows. The headline to watch is “${title}”.`;
}
async function fetchFeed(feed){
  const res = await fetch(feed.url, { headers: { 'user-agent':'CelebRumourWire/3.0' } });
  const xml = await res.text();
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/g)].slice(0,12).map(m=>m[0]);
  return items.map((item,i)=>{
    const get = (tag)=> decode(stripTags((item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))||[])[1]||''));
    const rawTitle = get('title');
    const rawSummary = get('description');
    const link = get('link') || ((item.match(/<link>(.*?)<\/link>/)||[])[1]||'');
    const publishedAt = get('pubDate') || new Date().toISOString();
    const angle = pickAngle(rawTitle, rawSummary);
    const story = { id: `${feed.name}-${i}-${slugify(rawTitle)}`, slug: slugify(rawTitle), title: rawTitle, summary: rawSummary.slice(0,220), source: feed.name, sourceTier: feed.tier, sourceUrl: link, publishedAt, angle, confidence: feed.tier === 'Tabloid' ? 'Gossip source' : 'Publisher report' };
    story.rumourWriteup = writeup(story);
    return story;
  }).filter(s=>s.title && s.sourceUrl);
}
export async function onRequest(){
  const all = [];
  for (const feed of FEEDS){ try { all.push(...await fetchFeed(feed)); } catch(e){} }
  all.sort((a,b)=> new Date(b.publishedAt)-new Date(a.publishedAt));
  return Response.json({ count: all.length, updatedAt: new Date().toISOString(), stories: all.slice(0,50) }, { headers: { 'cache-control':'public, max-age=300' }});
}
