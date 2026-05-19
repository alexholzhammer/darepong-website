---
title: "Kontakt"
description: "Fragen zu Dare Pong? Schreib uns – wir melden uns schnell."
layout: layouts/legal.njk
pageCSS: legal.css
---

# Kontakt

Fragen zum Spiel, zur Lieferung oder einfach Feedback? Schreib uns — wir melden uns innerhalb von 1–2 Werktagen.

<form class="contact-form" action="https://formspree.io/f/xnjwrdwy" method="POST">
  <input type="hidden" name="_subject" value="Neue Kontaktanfrage – Dare Pong">
  <input type="text" name="_gotcha" style="display:none">

  <div class="contact-form__field">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required placeholder="Dein Name">
  </div>

  <div class="contact-form__field">
    <label for="email">E-Mail</label>
    <input type="email" id="email" name="email" required placeholder="deine@email.de">
  </div>

  <div class="contact-form__field">
    <label for="message">Nachricht</label>
    <textarea id="message" name="message" rows="6" required placeholder="Deine Nachricht..."></textarea>
  </div>

  <button type="submit" class="btn btn--primary">Nachricht senden</button>
</form>
