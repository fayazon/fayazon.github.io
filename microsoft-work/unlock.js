const form = document.getElementById('unlock');
const error = document.getElementById('error');
const bytes = value => Uint8Array.from(atob(value), character => character.charCodeAt(0));
const caseHeader = '<header class="cs-top"><div class="cs-wrap"><a class="cs-brand" href="../../index.html" aria-label="Fayaz home">Fayaz</a><nav class="cs-nav" aria-label="Main navigation"><a href="../../index.html#work">Selected work</a><a href="../">Microsoft work</a><a href="../../index.html#about">About</a><a href="../../index.html#contact">Let’s talk ↗</a></nav></div></header>';

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = 'Opening project…';
  const password = form.password.value;
  try {
    const payload = await (await fetch('./payload.json', { cache: 'no-store' })).json();
    const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(payload.salt), iterations: 210000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(payload.iv) }, key, bytes(payload.ciphertext));
    const html = new TextDecoder().decode(plain)
      .replace('</head>', '<link rel="stylesheet" href="../case-style.css"></head>')
      .replace(/<header class="cs-top">[\s\S]*?<\/header>/, caseHeader);
    document.open();
    document.write(html);
    document.close();
  } catch {
    error.textContent = 'That password did not unlock this project. Please try again.';
  }
});
