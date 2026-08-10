const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
};

if (typeof window === "undefined") {
  const globalScope = globalThis as typeof globalThis & {
    localStorage?: Storage;
    sessionStorage?: Storage;
  };

  if (!globalScope.localStorage || typeof globalScope.localStorage.getItem !== "function") {
    Object.defineProperty(globalScope, "localStorage", {
      configurable: true,
      value: noopStorage,
    });
  }

  if (!globalScope.sessionStorage || typeof globalScope.sessionStorage.getItem !== "function") {
    Object.defineProperty(globalScope, "sessionStorage", {
      configurable: true,
      value: noopStorage,
    });
  }
}
