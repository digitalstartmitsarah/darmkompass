# Darmkur-Kompass · Sarah Plainer

Interaktives Tool für die Ringana Darmkur mit KI-Rezeptgenerator.

---

## Deploy in 5 Schritten

### Schritt 1: GitHub Repository erstellen
1. github.com → "New repository"
2. Name: `darmkur-kompass`
3. Alle Dateien hochladen (Ordnerstruktur beibehalten!)

### Schritt 2: Netlify verbinden
1. netlify.com → "Add new site" → "Import from Git"
2. GitHub verbinden → Repository `darmkur-kompass` wählen
3. Build settings werden automatisch erkannt
4. "Deploy site" klicken

### Schritt 3: API Key setzen
1. Netlify → Site configuration → Environment variables
2. "Add variable":
   - Key: `ANTHROPIC_API_KEY`
   - Value: dein Key von console.anthropic.com
3. Als Secret markieren → Speichern

### Schritt 4: Neu deployen
Deploys → "Trigger deploy" → "Deploy site"

### Schritt 5: Fertig!
Du bekommst eine URL wie `darmkur-kompass.netlify.app`

---

## Dateien
```
darmkur-kompass/
├── netlify.toml
├── README.md
├── public/
│   └── index.html          ← Das komplette Tool
└── netlify/
    └── functions/
        └── kompass.js      ← KI Rezeptgenerator
```

## Formspree
Bestellungen gehen an: formspree.io/f/mojoondj
→ va_sarah@outlook.com

## Kosten
- GitHub: kostenlos
- Netlify: kostenlos
- Anthropic API: ca. 0,01-0,02 € pro Rezept-Generierung
