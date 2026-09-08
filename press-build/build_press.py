#!/usr/bin/env python3
"""
build_press.py — Regenerate rushkoff.com/press.html from the Google Doc master.

USAGE:
    python3 build_press.py <doc_input> [output_html]

<doc_input>  : a file containing the Google Doc's text. Either
               (a) the JSON returned by the Google Drive reader: {"fileContent": "..."} , or
               (b) the raw exported text of the doc.
[output_html]: where to write the page (default: ../press.html relative to this script,
               i.e. the website repo root).

The Google Doc (master) lives at:
    https://docs.google.com/document/d/1EA7D1hFewzyXqpP9PWxglK1lnXp0zywJDiXC5zfHkFw/edit
A human edits that doc; this script converts it into the static, searchable
archive-style press.html. Nothing on the page depends on Google at runtime.
"""
import json, re, sys, os

# --- Manual corrections the doc can't (yet) express. url -> (date_str, year) ---
OVERRIDE = {
    "https://www.youtube.com/watch?v=rxSdzapOmzM": ("May 13, 2026", "2026"),  # MK Ultra / NewsNation
}

SECMAP = [("Interviews","text"),("Reviews","text"),("Profiles","text"),("Talks","video"),
 ("Documentaries/Movies","video"),("TV/Documentary","video"),("Radio/Podcasts","audio"),
 ("Served as source","text"),("Miscellaneous","text")]
CATMAP = {"Interviews":"Interviews","Reviews":"Reviews","Profiles":"Profiles","Talks":"Talks",
 "Documentaries/Movies":"TV & Film","TV/Documentary":"TV & Film",
 "Radio/Podcasts":"Radio & Podcasts","Served as source":"As Source","Miscellaneous":"Misc"}
CAT_ORDER = ["Interviews","Reviews","Profiles","Talks","TV & Film","Radio & Podcasts","As Source","Misc"]

MONTHS = r'(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)'
DATE_RE = re.compile(MONTHS + r'\.?\s+(?:\d{1,2},?\s*)?(\d{4})')

def secinfo(raw):
    for key, med in SECMAP:
        if raw.lower().startswith(key.split('/')[0].lower()) or key.lower() in raw.lower():
            return key, med
    return raw, "text"

def parse_sourcedate(rem, defnote=""):
    note = defnote
    nm = re.search(r'\bNOTE:\s*(.*)$', rem, re.I)
    if nm: note = nm.group(1).strip(); rem = rem[:nm.start()].strip(' ,;')
    date = ""; year = ""
    dm = DATE_RE.search(rem)
    if dm:
        date = dm.group(0); year = dm.group(1); source = rem[:dm.start()] + rem[dm.end():]
    else:
        yrs = re.findall(r'(?:19|20)\d{2}', rem)
        if yrs: year = yrs[-1]; date = year; source = rem.replace(year, '', 1)
        else: source = rem
    source = source.strip()
    mnote = re.match(r'^\((.*?)\)\s*(.*)$', source)
    if mnote and mnote.group(2):
        note = (note + "; " if note else "") + mnote.group(1).strip(); source = mnote.group(2).strip()
    source = source.replace('*', '').strip(' ,;–-—').strip()
    return source, note, date, year

def parse_doc(text):
    secs = re.split(r'\n##\s+', text)
    records = []
    for s in secs[1:]:
        head = s.split('\n', 1)[0].strip()
        if head.lower().startswith("things to add"):
            continue
        body = s.split('\n', 1)[1] if '\n' in s else ''
        secname, defmedia = secinfo(head)
        blocks = [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]
        for b in blocks:
            important = bool(re.match(r'^\\?\*\s*', b)); b2 = re.sub(r'^\\?\*\s*', '', b)
            m = re.search(r'\[(.*?)\]\((.*?)\)', b2, re.DOTALL)
            if m:
                title = re.sub(r'\s+', ' ', m.group(1)).strip(); url = m.group(2).strip(); remainder = b2[m.end():]
            else:
                bare = re.search(r'<(https?://[^>]+)>', b2)
                if bare:
                    url = bare.group(1); title = ""; remainder = b2[bare.end():]
                else:
                    # continuation block: source/date on a line below its link
                    if records and records[-1]['section'] == secname and not records[-1]['source'] and not records[-1]['year']:
                        rem = re.sub(r'\s+', ' ', b2).strip(' ,;')
                        src, note, date, year = parse_sourcedate(rem, records[-1].get('note', ''))
                        if src or year:
                            records[-1]['source'] = src or records[-1]['source']
                            records[-1]['date'] = date; records[-1]['year'] = year
                            if note: records[-1]['note'] = note
                    continue
            media = defmedia
            rl = remainder.lower()
            if '(video)' in rl: media = 'video'
            elif '(audio)' in rl or '(podcast)' in rl: media = 'audio'
            elif '(text)' in rl: media = 'text'
            rem = re.sub(r'\s+', ' ', remainder).strip()
            rem = re.sub(r'\((?:video|audio|text|podcast)\)', '', rem, flags=re.I).strip(' ,;')
            src, note, date, year = parse_sourcedate(rem)
            if not year:
                um = re.search(r'/((?:19|20)\d{2})/', url)
                if um: year = um.group(1)
            records.append(dict(section=secname, media=media, important=important, title=title,
                                url=url, source=src, note=note, date=date, year=year))
    for r in records:
        if r['url'] in OVERRIDE:
            r['date'], r['year'] = OVERRIDE[r['url']]
    return records

TEMPLATE = r'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Douglas Rushkoff &mdash; Press Archive</title>
<meta name="description" content="Selected press, interviews, reviews, profiles, talks, and media appearances by Douglas Rushkoff, 1994&ndash;2026 &mdash; fully searchable.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Gelasio:wght@500;600&family=M+PLUS+1:wght@500;700&display=swap" rel="stylesheet">
<style>
  :root{
    --ink:#2c3e50; --muted:#6d7278; --link:#0a58ca; --rule:#e6e8eb; --bg:#ffffff;
    --chip-bg:#f2f3f5; --chip-active:#2c3e50;
    --v:#1256a3; --a:#6b46c1; --tx:#6d7278;
    --font-title:"M PLUS 1", system-ui, sans-serif;
    --font-body:"Fira Sans", system-ui, sans-serif;
    --font-brand:"Gelasio", Georgia, serif;
  }
  *{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font-body);
    font-size:16px;line-height:1.5}
  a{color:var(--link);text-decoration:none}
  a:hover{text-decoration:underline}
  .wrap{max-width:860px;margin:0 auto;padding:0 20px}
  header.masthead{padding:34px 0 8px}
  .backlink{font-size:13px;color:var(--muted);text-decoration:none;letter-spacing:.02em}
  .backlink:hover{color:var(--link)}
  .brand{font-family:var(--font-brand);font-weight:600;font-size:30px;line-height:1.1;margin-top:12px}
  .kicker{font-family:var(--font-title);font-weight:700;letter-spacing:.16em;text-transform:uppercase;
    font-size:12px;color:var(--muted);margin-top:6px}
  .lead{color:var(--muted);font-size:14.5px;margin:10px 0 0;max-width:60ch}
  .toolbar{position:sticky;top:0;z-index:5;background:var(--bg);
    padding:16px 0 12px;border-bottom:1px solid var(--rule)}
  .search{width:100%;font-family:var(--font-body);font-size:16px;color:var(--ink);
    padding:11px 14px;border:1px solid #cfd3d8;border-radius:8px;outline:none;background:#fff}
  .search:focus{border-color:var(--link);box-shadow:0 0 0 3px rgba(10,88,202,.15)}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
  .chip{font-family:var(--font-body);font-size:13.5px;line-height:1;cursor:pointer;
    border:1px solid transparent;background:var(--chip-bg);color:var(--ink);
    padding:8px 13px;border-radius:999px;white-space:nowrap}
  .chip:hover{background:#e7e9ec}
  .chip[aria-pressed="true"]{background:var(--chip-active);color:#fff}
  .count{margin-top:11px;font-size:13px;color:var(--muted)}
  main{padding:8px 0 60px}
  .yearlabel{font-family:var(--font-title);font-weight:700;font-size:13px;color:var(--muted);
    letter-spacing:.06em;margin:22px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--rule)}
  ul.list{list-style:none;margin:0;padding:0}
  li.item{margin-bottom:.55em;line-height:1.34}
  .line{font-size:16px}
  .t{font-family:var(--font-title);font-weight:700;color:var(--ink)}
  a.t:hover{color:var(--link);text-decoration:none}
  .star{color:#c99700;font-weight:700;margin-right:2px}
  .src{font-style:italic;color:var(--ink)}
  .date{color:var(--muted)}
  .badge{display:inline-block;font-family:var(--font-body);font-size:10.5px;font-weight:600;
    letter-spacing:.08em;text-transform:uppercase;padding:1px 6px;border-radius:4px;
    border:1px solid currentColor;margin-left:8px;vertical-align:1px;white-space:nowrap}
  .badge.video{color:var(--v)} .badge.audio{color:var(--a)} .badge.text{color:var(--tx)}
  .status{padding:40px 0;color:var(--muted);text-align:center}
  footer{border-top:1px solid var(--rule);padding:22px 0 40px;color:var(--muted);font-size:13px}
  footer a{color:var(--muted);text-decoration:underline}
  @media (max-width:560px){ header.masthead{padding:24px 0 6px} .brand{font-size:26px} }
</style>
</head>
<body>
<header class="masthead">
  <div class="wrap">
    <a class="backlink" href="https://rushkoff.com">&larr; rushkoff.com</a>
    <div class="brand">Douglas Rushkoff</div>
    <div class="kicker">Press Archive</div>
    <p class="lead">Selected press, interviews, reviews, profiles, talks, and media appearances, 1994&ndash;2026.</p>
  </div>
</header>
<div class="toolbar">
  <div class="wrap">
    <input id="q" class="search" type="search" autocomplete="off" spellcheck="false"
      placeholder="Search title, publication, year&hellip;" aria-label="Search press">
    <div class="chips" id="chips" role="group" aria-label="Filter by type"></div>
    <div class="count" id="count" aria-live="polite"></div>
  </div>
</div>
<main>
  <div class="wrap">
    <div id="status" class="status">Loading&hellip;</div>
    <div id="list"></div>
  </div>
</main>
<footer>
  <div class="wrap">
    Douglas Rushkoff&rsquo;s press archive.
    &nbsp;&middot;&nbsp; <a href="https://archive.rushkoff.com/">Article archive</a>
    &nbsp;&middot;&nbsp; <a href="https://rushkoff.com">rushkoff.com</a>
  </div>
</footer>
<script>
var DATA = __PAYLOAD__;
var CATS = __CATS__;
(function(){
  var activeCat=null, tokens=[];
  var elList=document.getElementById('list'), elStatus=document.getElementById('status');
  var elCount=document.getElementById('count'), elChips=document.getElementById('chips'), elQ=document.getElementById('q');
  function esc(s){return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  DATA.forEach(function(a){ a._h=((a.t||'')+' '+(a.s||'')+' '+(a.n||'')+' '+(a.d||'')+' '+(a.c||'')).toLowerCase(); });
  function buildChips(){
    var frag=document.createDocumentFragment();
    function mk(label,val){
      var b=document.createElement('button'); b.className='chip'; b.type='button'; b.textContent=label;
      b.setAttribute('aria-pressed', val===activeCat?'true':'false');
      b.addEventListener('click',function(){
        activeCat=(activeCat===val)?null:val;
        [].forEach.call(elChips.children,function(c){c.setAttribute('aria-pressed', c===b&&activeCat===val?'true':'false');});
        render();
      });
      return b;
    }
    frag.appendChild(mk('All',null));
    CATS.forEach(function(c){frag.appendChild(mk(c,c));});
    elChips.appendChild(frag);
  }
  function matches(a){
    if(activeCat && a.c!==activeCat) return false;
    for(var i=0;i<tokens.length;i++){ if(a._h.indexOf(tokens[i])===-1) return false; }
    return true;
  }
  function rowHTML(a){
    var star=a.imp?'<span class="star" title="Notable">&#9733;</span>':'';
    var title=a.u?'<a class="t" href="'+esc(a.u)+'" target="_blank" rel="noopener">'+esc(a.t)+'</a>':'<span class="t">'+esc(a.t)+'</span>';
    var meta='';
    if(a.s){ meta+=' <span class="src">'+esc(a.s)+'</span>'; }
    if(a.d){ meta+='<span>'+(a.s?', ':' ')+'</span><span class="date">'+esc(a.d)+'</span>'; }
    else if(!a.s && a.n){ meta+=' <span class="date">'+esc(a.n)+'</span>'; }
    var badge=(a.m==='video'||a.m==='audio')?' <span class="badge '+a.m+'">'+a.m+'</span>':'';
    return '<li class="item"><div class="line">'+star+title+'<span>.</span>'+meta+badge+'</div></li>';
  }
  function render(){
    var q=elQ.value.trim().toLowerCase();
    tokens=q.length?q.split(/\s+/):[];
    var cur=null, out=[], n=0, open=false;
    for(var i=0;i<DATA.length;i++){
      var a=DATA[i]; if(!matches(a)) continue;
      var yl=a.y||'Earlier / undated';
      if(yl!==cur){ if(open){out.push('</ul>');} cur=yl; out.push('<div class="yearlabel">'+esc(yl)+'</div><ul class="list">'); open=true; }
      out.push(rowHTML(a)); n++;
    }
    if(open) out.push('</ul>');
    elList.innerHTML = n? out.join('') : '<div class="status">No matches.</div>';
    var total=DATA.length;
    elCount.textContent = (n===total? total.toLocaleString()+' pieces' : n.toLocaleString()+' of '+total.toLocaleString()+' pieces');
  }
  var t; elQ.addEventListener('input',function(){clearTimeout(t);t=setTimeout(render,110);});
  elStatus.style.display='none'; buildChips(); render();
})();
</script>
</body>
</html>
'''

def build(records):
    data = []
    for r in records:
        data.append({"t": r["title"] or "(link)", "u": r["url"], "s": r["source"], "n": r.get("note",""),
                     "d": r["date"], "y": r["year"], "m": r["media"],
                     "c": CATMAP.get(r["section"], r["section"]), "imp": bool(r.get("important"))})
    data.sort(key=lambda x: (0, -int(x["y"])) if x["y"] else (1, 0))
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    return TEMPLATE.replace("__PAYLOAD__", payload).replace("__CATS__", json.dumps(CAT_ORDER)), len(data)

def load_text(path):
    raw = open(path, encoding="utf-8").read()
    try:
        obj = json.loads(raw)
        if isinstance(obj, dict) and "fileContent" in obj:
            return obj["fileContent"]
    except Exception:
        pass
    return raw

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    doc_in = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "press.html")
    text = load_text(doc_in)
    records = parse_doc(text)
    html, n = build(records)
    open(out, "w", encoding="utf-8").write(html)
    undated = sum(1 for r in records if not r["year"])
    print("Parsed %d entries (%d undated). Wrote %s (%d bytes)." % (n, undated, os.path.abspath(out), len(html)))
    from collections import Counter
    cc = Counter(CATMAP.get(r["section"], r["section"]) for r in records)
    print("Categories:", dict(cc))

if __name__ == "__main__":
    main()
