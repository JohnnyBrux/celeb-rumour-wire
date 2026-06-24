const FEEDS = [
  { name: "BBC Ents & Arts", url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", tier: "Reliable news", tag: "news" },
  { name: "TMZ", url: "https://www.tmz.com/rss.xml", tier: "Gossip source", tag: "gossip" },
  { name: "Entertainment Tonight", url: "https://www.etonline.com/news/rss", tier: "Entertainment source", tag: "news" },
  { name: "Variety", url: "https://variety.com/feed/", tier: "Industry source", tag: "industry" },
  { name: "OK! Magazine", url: "https://www.ok.co.uk/rss.xml", tier: "Gossip source", tag: "gossip" }
];

const CELEBS = ["Taylor Swift","Selena Gomez","Beyonce","Beyoncé","Kardashian","Kim Kardashian","Kylie Jenner","Rihanna","Harry Styles","Ariana Grande","Justin Bieber","Hailey Bieber","Zendaya","Tom Holland","Dua Lipa","Miley Cyrus","Britney Spears","Jennifer Lopez","Ben Affleck","Love Island","Molly-Mae","Tommy Fury"];

function between(str, start, end) {
  const s = str.indexOf(start); if (s < 0) return "";
  const e = str.indexOf(end, s + start.length); if (e < 0) return "";
  return str.slice(s + start.length, e);
}
function clean(s = "") {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();
}
function itemsFromXml(xml) {
  const raw = xml.match(/<item[\s\S]*?<\/item>/g) || xml.match(/<entry[\s\S]*?<\/entry>/g) || [];
  return raw.slice(0, 12).map(block => ({
    title: clean(between(block, "<title>", "</title>")),
    link: clean(between(block, "<link>", "</link>") || (block.match(/<link[^>]*href=["']([^"']+)/)||[])[1] || ""),
    description: clean(between(block, "<description>", "</description>") || between(block, "<summary>", "</summary>") || between(block, "<content:encoded>", "</content:encoded>")),
    pubDate: clean(between(block, "<pubDate>", "</pubDate>") || between(block, "<updated>", "</updated>") || between(block, "<published>", "</published>"))
  })).filter(i => i.title && i.link);
}
function detectCeleb(text) {
  return CELEBS.find(c => text.toLowerCase().includes(c.toLowerCase())) || "Celebrity Watch";
}
function angleFor(title, desc, source) {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("split") || text.includes("divorce") || text.includes("breakup")) return "Relationship Watch";
  if (text.includes("lawsuit") || text.includes("court") || text.includes("charged")) return "Legal Drama";
  if (text.includes("album") || text.includes("tour") || text.includes("single")) return "Music Buzz";
  if (text.includes("film") || text.includes("movie") || text.includes("show")) return "Screen Buzz";
  if (source.tag === "gossip") return "Rumour Mill";
  return "Celeb News";
}
function writeRumour(item, source) {
  const celeb = detectCeleb(`${item.title} ${item.description}`);
  const angle = angleFor(item.title, item.description, source);
  const base = item.description || item.title;
  const teaser = base.length > 180 ? base.slice(0, 177).trim() + "..." : base;
  return {
    id: btoa(unescape(encodeURIComponent(item.link))).replace(/=/g, "").slice(0, 24),
    title: item.title,
    celeb,
    angle,
    source: source.name,
    sourceTier: source.tier,
    sourceUrl: item.link,
    publishedAt: item.pubDate || new Date().toUTCString(),
    summary: `According to ${source.name}, ${teaser}`,
    rumourWriteup: `${angle}: ${celeb} is back on the gossip radar after ${source.name} published a new update. We are treating this as source-led chatter for now, not confirmed fact. Read the original report before taking it as gospel.`,
    confidence: source.tag === "industry" || source.name.includes("BBC") ? "News report" : "Unconfirmed chatter"
  };
}

export async function onRequest() {
  const all = [];
  await Promise.all(FEEDS.map(async source => {
    try {
      const res = await fetch(source.url, { headers: { "User-Agent": "CelebRumourWire/2.0" } });
      const xml = await res.text();
      itemsFromXml(xml).forEach(item => all.push(writeRumour(item, source)));
    } catch (e) {}
  }));
  all.sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return new Response(JSON.stringify({ updatedAt: new Date().toISOString(), count: all.length, stories: all.slice(0, 40) }), { headers: { "content-type": "application/json", "cache-control": "public, max-age=300" } });
}
