const viewCache = new Map();

export const getViewCache = (key) => viewCache.get(key);

export const setViewCache = (key, value) => {
  viewCache.set(key, value);
  return value;
};

export const hasViewCache = (key) => viewCache.has(key);

export const deleteViewCache = (key) => viewCache.delete(key);

export const getViewCacheEntries = () => Array.from(viewCache.entries());

export const clearViewCache = () => {
  viewCache.clear();
};
