Selbst gehostete Webfonts (SIL Open Font License 1.1, Lizenztexte: OFL-*.txt).
Werden in src/_includes/layouts/base.njk per @font-face eingebunden.

graduate-regular.woff2
  Komplette, unveränderte Graduate-Regular.ttf aus github.com/google/fonts
  (ofl/graduate), nur WOFF2-komprimiert. Nicht subsetten: "Graduate" ist ein
  Reserved Font Name, ein Subset dürfte laut OFL nicht so heißen.

inter-latin-variable.woff2
  Latin-Subset von Google Fonts (Inter v20), variabel (wght 100-900).

jetbrains-mono-latin-400.woff2
  Latin-Subset von Google Fonts (JetBrains Mono v24), auf wght 400 fixiert
  (fonttools varLib.instancer). Nur .dare-cell__id nutzt diese Schrift.

Das Latin-Subset enthält alle deutschen Zeichen (ä ö ü ß € „ “ – …). ẞ (U+1E9E)
fehlt und würde aus der Systemschrift kommen.

Die Dateien werden laut src/_headers ein Jahr gecacht: Bei neuem Inhalt die
Datei umbenennen, nicht überschreiben.
