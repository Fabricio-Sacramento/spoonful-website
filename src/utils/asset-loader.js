// src/utils/asset-loader.js
// Precarregador robusto de imagens

class AssetLoader {
  constructor() {
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.failedAssets = 0;
    this.listeners = new Set();
  }

  /**
   * Precarrega array de URLs de imagens
   * @param {string[]} urls - Array de URLs
   * @returns {Promise} - Resolve quando todas carregaram (ou falharam)
   */
  async loadImages(urls) {
    if (!Array.isArray(urls) || urls.length === 0) {
      console.warn('⚠️ AssetLoader: No URLs provided');
      return;
    }

    this.totalAssets = urls.length;
    this.loadedAssets = 0;
    this.failedAssets = 0;

    console.log(`📦 AssetLoader: Starting to load ${this.totalAssets} images`);

    const promises = urls.map((url) => this.loadImage(url));  // ⬅️ SEM index

    await Promise.allSettled(promises);

    console.log(`✅ AssetLoader: Complete - ${this.loadedAssets} loaded, ${this.failedAssets} failed`);
  }

  /**
   * Precarrega uma única imagem
   */
  loadImage(url) {  // ⬅️ REMOVIDO parâmetro 'index' não usado
    return new Promise((resolve) => {
      const img = new Image();
      let settled = false;

      const onLoad = () => {
        if (settled) return;
        settled = true;
        this.loadedAssets++;
        this.notifyProgress();
        console.log(`✅ [${this.loadedAssets}/${this.totalAssets}] ${url.split('/').pop()}`);
        resolve({ url, status: 'loaded' });
      };

      const onError = () => {
        if (settled) return;
        settled = true;
        this.failedAssets++;
        this.loadedAssets++; // Conta como "processado"
        this.notifyProgress();
        console.warn(`❌ [${this.loadedAssets}/${this.totalAssets}] Failed: ${url}`);
        resolve({ url, status: 'failed' });
      };

      // Timeout de segurança (10s por imagem)
      const timeout = setTimeout(() => {
        if (!settled) {
          console.warn(`⏱️ Timeout loading: ${url}`);
          onError();
        }
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        onLoad();
      };

      img.onerror = () => {
        clearTimeout(timeout);
        onError();
      };

      img.src = url;
    });
  }

  /**
   * Registra listener de progresso
   * @param {Function} callback - (progress: 0-100) => void
   * @returns {Function} unsubscribe
   */
  onProgress(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyProgress() {
    const progress = this.totalAssets > 0 
      ? (this.loadedAssets / this.totalAssets) * 100 
      : 0;

    this.listeners.forEach(callback => {
      try {
        callback(progress);
      } catch (err) {
        console.error('Error in progress callback:', err);
      }
    });
  }

  getProgress() {
    return this.totalAssets > 0 
      ? (this.loadedAssets / this.totalAssets) * 100 
      : 0;
  }

  reset() {
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.failedAssets = 0;
  }
}

// Singleton
const assetLoader = new AssetLoader();
export default assetLoader;