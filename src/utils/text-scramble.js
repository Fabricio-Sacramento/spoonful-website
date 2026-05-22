// src/utils/text-scramble.js
// Classe TextScramble com Promise cancelável e API robusta

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
    this.frameRequest = null;
    this.resolve = null;
    this.queue = [];
    this.frame = 0;
    this._isRunning = false;
    this._isCancelled = false;
  }

  /**
   * Define novo texto com scramble effect
   * @param {string} newText - Texto final a ser revelado
   * @returns {Promise} Resolve quando animação completa
   */
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    
    // Cancela animação anterior se existir
    this.cancel();
    
    // Reset de flags
    this._isCancelled = false;
    this._isRunning = true;
    
    const promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    this.frame = 0;
    this.update();
    
    return promise;
  }

  /**
   * Update loop via RAF
   */
  update() {
    // Guard: se cancelado, para imediatamente
    if (this._isCancelled) {
      this._isRunning = false;
      return;
    }

    const fragment = document.createDocumentFragment();
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        fragment.append(document.createTextNode(to));
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        const span = document.createElement('span');
        span.className = 'dud';
        span.textContent = char;
        fragment.append(span);
      } else {
        fragment.append(document.createTextNode(from));
      }
    }

    this.el.replaceChildren(fragment);

    if (complete === this.queue.length) {
      this._isRunning = false;
      if (this.resolve) {
        this.resolve();
        this.resolve = null;
        this.reject = null;
      }
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  /**
   * Gera caractere aleatório
   */
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  /**
   * Cancela animação em progresso
   */
  cancel() {
    this._isCancelled = true;
    this._isRunning = false;
    
    if (this.frameRequest !== null) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }

    // Rejeita promise pendente
    if (this.reject) {
      this.reject(new Error('TextScramble cancelled'));
      this.resolve = null;
      this.reject = null;
    }
  }

  /**
   * Verifica se animação está rodando
   * @returns {boolean}
   */
  isRunning() {
    return this._isRunning;
  }

  /**
   * Cleanup completo
   */
  destroy() {
    this.cancel();
    this.el = null;
    this.queue = [];
  }
}

export default TextScramble;