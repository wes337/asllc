class Cache {
  static keyPrefix = "asllc:";
  static supported = typeof Storage !== "undefined";

  static {
    this.clear();
  }

  static set(key, value, ttl) {
    if (!this.supported) {
      return;
    }

    const ttlMS = ttl * 1000;

    const item = {
      value,
      expiry: ttl === 0 ? null : Date.now() + ttlMS,
    };

    localStorage.setItem(this.keyPrefix + key, JSON.stringify(item));
  }

  static delete(key) {
    localStorage.removeItem(this.keyPrefix + key);
  }

  static get(key) {
    if (!this.supported) {
      return;
    }

    const itemJSON = localStorage.getItem(this.keyPrefix + key);

    if (!itemJSON) {
      return null;
    }

    const item = JSON.parse(itemJSON);

    if (!item || (item.expiry !== null && Date.now() > item.expiry)) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  }

  static clear() {
    if (!this.supported) {
      return;
    }

    for (var i = 0; i < localStorage.length; i++) {
      const itemKey = localStorage.key(i);

      const validKey = itemKey && itemKey.startsWith(this.keyPrefix);

      if (validKey) {
        const itemJSON = localStorage.getItem(itemKey);
        const item = itemJSON ? JSON.parse(itemJSON) : null;

        if (item) {
          if (item.expiry !== null && Date.now() > item.expiry) {
            localStorage.removeItem(itemKey);
          }
        }
      }
    }
  }
}

export default Cache;
