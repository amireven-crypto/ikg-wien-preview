# IKG Wien – Konzept-Demo (PIXELPOP)

Lokale, unveröffentlichte Neugestaltung von [ikg-wien.at](https://www.ikg-wien.at/) für das Portfolio von PIXELPOP.

**Konzept-Demo von PIXELPOP – keine offizielle Seite der IKG Wien.**

Nicht pushen, nicht als offizielle Seite ausgeben. Alle Handlungen (Spenden, Mitgliedschaft, Kontakt, Anmeldungen) führen auf die echten IKG-Seiten.

## Lokal ansehen

Im Ordner `/workspace/demo-ikg-wien` einen statischen Server starten, zum Beispiel:

```bash
python3 -m http.server 8770 --bind 127.0.0.1
```

Dann http://127.0.0.1:8770/ öffnen.

## Gestaltung

- motion-anything Design-System: **Editorial** (Gelasio, Schwarz/Weiß/Hellgrau, 8-Punkt-Raster)
- Rezepte: `scroll-reveal`, `fade-in-up`, `stagger-list`, `card-lift-hover` (kein Hover auf Gedenk-Karten)
- Lokale Schriften, kein Google-Fonts-CDN
- `prefers-reduced-motion` wird von den Rezepten beachtet

Quellen und Bildrechte: `SOURCES.md`
