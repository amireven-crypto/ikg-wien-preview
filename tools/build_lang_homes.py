"""Generate en.html / hebrew-landing-page.html / ru.html from the German index.html
so that every language homepage has exactly the same markup, CSS and assets.
Only text strings (and lang/dir attributes, switcher state, same-language links) differ.
Usage: python3 build_lang_homes.py <site-root>"""
import sys, os, json, re, copy
from bs4 import BeautifulSoup, Comment, NavigableString
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tr_home

root = sys.argv[1]
linkmap = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'linkmap.json')))
norm = lambda s: ' '.join(s.split())

LANG = {
  'en': dict(file='en.html', flag='gb', code='EN', name='English', label='Language, English',
             orig='en-original.html', orig_text='Original English start page of ikg-wien.at (archived copy)',
             home_fallback='en.html'),
  'he': dict(file='hebrew-landing-page.html', flag='il', code='HE', name='עברית', label='שפה, עברית',
             orig='he-original.html', orig_text='דף הבית המקורי בעברית של ikg-wien.at (עותק בארכיון)',
             home_fallback='hebrew-landing-page.html'),
  'ru': dict(file='ru.html', flag='ru', code='RU', name='Русский', label='Язык, Русский',
             orig=None, orig_text=None, home_fallback='ru.html'),
}
BANNER = {
  'en': "Concept demo by PIXELPOP · not an official IKG Wien page · demo translation ·",
  'he': "הדגמת קונספט של PIXELPOP · אינו אתר רשמי של IKG Wien · תרגום הדגמה ·",
  'ru': "Концепт-демо PIXELPOP · не официальный сайт IKG Wien · демо-перевод ·",
}
HOME_FILES = {'de': 'index.html', 'en': 'en.html', 'he': 'hebrew-landing-page.html', 'ru': 'ru.html'}

src = open(os.path.join(root, 'index.html'), encoding='utf-8').read()

def build(lang):
    cfg = LANG[lang]
    table = tr_home.table(lang)
    table["Konzept-Demo von PIXELPOP · keine offizielle Seite der IKG Wien ·"] = BANNER[lang]
    if lang == 'he':
        table['und'] = 'וכן'
    s = BeautifulSoup(src, 'html.parser')
    s.html['lang'] = lang
    if lang == 'he':
        s.html['dir'] = 'rtl'
    missing = set()
    # text nodes
    for t in list(s.find_all(string=True)):
        if isinstance(t, Comment) or t.parent.name in ('script', 'style'):
            continue
        if t.find_parent(class_=['lang-menu', 'lang-flags', 'lang-switcher']):
            continue
        n = norm(t)
        if not n:
            continue
        if n in table:
            new = table[n]
            lead = re.match(r'^\s*', t).group(0)
            trail = re.search(r'\s*$', t).group(0)
            if new in ('.', ',') and not lead.strip():
                lead = ''
            t.replace_with(NavigableString(lead + new + trail))
        elif re.search(r'[a-zäöüß]{4,}', n) and t.parent.name != 'title':
            missing.add(n)
    # attributes
    for el in s.find_all(True):
        for a in ('alt', 'aria-label', 'title', 'placeholder'):
            if el.get(a) and norm(el[a]) in table:
                el[a] = table[norm(el[a])]
        if el.name == 'meta' and el.get('name') == 'description':
            el['content'] = table.get(norm(el['content']), el['content'])
    # language switcher button
    btn = s.select_one('.lang-switcher-toggle')
    btn['aria-label'] = cfg['label']
    btn.select_one('img.lang-flag')['src'] = f"img/flags/{cfg['flag']}.svg"
    btn.select_one('.lang-code').string = cfg['code']
    for a in s.select('.lang-menu a, .lang-flags a'):
        for k in ('aria-current',):
            if k in a.attrs: del a[k]
        cls = [c for c in a.get('class', []) if c != 'is-current']
        if a.get('hreflang') == lang:
            cls.append('is-current'); a['aria-current'] = 'page'
        if cls: a['class'] = cls
        elif 'class' in a.attrs: del a['class']
    # same-language internal links
    lm = linkmap.get(lang, {})
    for a in s.find_all('a', href=True):
        if a.find_parent(class_=['lang-menu', 'lang-flags']):
            continue
        h = a['href']
        if re.match(r'^(https?:|mailto:|tel:|#|data:)', h):
            continue
        path, frag = (h.split('#', 1) + [''])[:2]
        if path == 'index.html':
            a['href'] = HOME_FILES[lang] + ('#' + frag if frag else '')
            continue
        tgt = lm.get(path)
        if tgt and tgt != cfg['home_fallback']:
            a['href'] = tgt + ('#' + frag if frag else '')
    # link to the preserved original landing page (text only, inside the footer note)
    if cfg['orig']:
        p = s.select_one('.footer-top p')
        p.append(' ')
        link = s.new_tag('a', href=cfg['orig'])
        link.string = cfg['orig_text']
        p.append(link)
    out = str(s)
    open(os.path.join(root, cfg['file']), 'w', encoding='utf-8').write(out)
    return missing

if __name__ == '__main__':
    for lang in ('en', 'he', 'ru'):
        m = build(lang)
        print(lang, 'untranslated with letters:', sorted(m))
