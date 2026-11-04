/* Inhalte der Google-Ads-Landingpage (/bierpong-spiel/).
   amazonUrl: hier den Amazon-Attribution-Link eintragen, sobald er vorliegt.
   Alle Buttons der Seite nutzen diesen einen Wert. */
module.exports = {
  amazonUrl: "https://amzn.to/4nA0xYQ",

  trust: [
    "120 Dares",
    "5 Kategorien",
    "Wasserfeste Karten",
    "Keine App nötig",
    "Versand durch Amazon"
  ],

  why: [
    {
      title: "Keine App. Kein QR-Code.",
      body: "Alles steht auf den Karten. Kein Handy am Tisch, kein Empfang nötig, kein Akku, der mitten im Spiel leer ist."
    },
    {
      title: "120 Dares, 5 Kategorien.",
      body: "Vom Flirt bis zur Mutprobe. Genug Aufgaben für viele Abende, und Ihr sortiert vorher aus, was nicht zu Eurer Runde passt."
    },
    {
      title: "Ihr entscheidet.",
      body: "Dare erfüllen und den Becher retten oder trinken. Niemand muss eine Aufgabe machen. Wer kneift, kommt der Niederlage aber näher."
    },
    {
      title: "Hält die Party aus.",
      body: "Die Karten sind wasserfest und reißfest. Umgekipptes Bier? Abwischen und weiterspielen."
    }
  ],

  /* Wörtliche Rezensionen von Amazon. Weitere Einträge erscheinen automatisch
     auf der Seite: { text: "...", who: "Vorname N." } */
  quotes: [
    {
      text: "Dare Pong ist eine super Ergänzung zu klassischem Bierpong",
      who: "Monja D."
    }
  ],

  /* Eigene Zusammenfassung von Amazon-Rezensionen, keine Zitate. */
  reviewThemes: [
    {
      title: "Bringt Abwechslung",
      body: "Käufer schätzen, dass aus dem bekannten Bierpong etwas Besonderes wird."
    },
    {
      title: "Beliebt als Geschenk",
      body: "Zum Beispiel zum 18. Geburtstag, für die eigene Party oder für Freunde."
    },
    {
      title: "Passt zu jeder Runde",
      body: "Wer möchte, nimmt einzelne Karten raus und stellt das Deck für die Gruppe zusammen."
    }
  ],

  occasions: [
    { title: "Wichteln & Geschenke", body: "Unter 10 € und garantiert kein Fehlgriff." },
    { title: "Silvester", body: "Der Abend ist lang. Die Karten reichen." },
    { title: "Geburtstag", body: "Bringt auch fremde Gäste schnell ins Gespräch." },
    { title: "JGA", body: "Für die Aufgaben, die man nie vergisst." },
    { title: "Festival & Camping", body: "Wasserfest und ohne Strom spielbar." }
  ],

  faq: [
    {
      q: "Was genau ist Dare Pong?",
      a: "Ein Kartenspiel für Bierpong: 120 wasserfeste Dare-Karten, die unter die Becher kommen. Trifft das gegnerische Team, deckt Ihr die Karte auf und entscheidet: erfüllen oder trinken."
    },
    {
      q: "Brauche ich Becher und Bälle?",
      a: "Ja, Dare Pong ist ein Spielzusatz für Eure Bierpong-Runde. Becher, Bälle und Getränke bringt Ihr selbst mit. Die Karten passen unter alle üblichen Bierpong-Becher."
    },
    {
      q: "Wie viele Personen können mitspielen?",
      a: "Dare Pong ist für 2 bis 8 Spieler gemacht und ab 18 Jahren."
    },
    {
      q: "Sind die Aufgaben zu krass für meine Gruppe?",
      a: "Jede Aufgabe darf abgelehnt werden, dann wird einfach getrunken. Und Ihr könnt vorher alle Karten aussortieren, die nicht zu Eurer Runde passen."
    },
    {
      q: "Kann man ohne Alkohol spielen?",
      a: "Klar. Die Dares funktionieren genauso gut mit Softdrinks. Der Spaß steckt in den Aufgaben, nicht im Getränk."
    },
    {
      q: "Wie läuft Versand und Rückgabe?",
      a: "Ihr bestellt direkt bei Amazon, von dort wird auch versendet. Die aktuelle Lieferzeit seht Ihr auf der Produktseite. Es gelten die Rückgabebedingungen von Amazon."
    }
  ]
};
