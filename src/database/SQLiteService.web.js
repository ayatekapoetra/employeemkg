const warnedMethods = new Set();

const warnWebFallback = (methodName) => {
  if (warnedMethods.has(methodName)) {
    return;
  }

  warnedMethods.add(methodName);
  console.warn(`[SQLiteService.web] ${methodName} is using web fallback.`);
};

const createAsyncFallback = (methodName, returnValue) => {
  return async (...args) => {
    void args;
    warnWebFallback(methodName);
    return typeof returnValue === 'function' ? returnValue() : returnValue;
  };
};

const webDatabase = {
  db: null,
  initialized: true,
  init: createAsyncFallback('init', undefined),
  ensureInitialized: createAsyncFallback('ensureInitialized', true),
  createTables: createAsyncFallback('createTables', undefined),
  upgradeTables: createAsyncFallback('upgradeTables', undefined),
  clear: createAsyncFallback('clear', true),
  clearAll: createAsyncFallback('clearAll', true),
  clearAllMasterData: createAsyncFallback('clearAllMasterData', true),
  getAll: createAsyncFallback('getAll', []),
  getAllAsync: createAsyncFallback('getAllAsync', []),
  getFirstAsync: createAsyncFallback('getFirstAsync', null),
  runAsync: createAsyncFallback('runAsync', { changes: 0, lastInsertRowId: 0 }),
};

const webDatabaseProxy = new Proxy(webDatabase, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }

    if (typeof prop === 'string') {
      return createAsyncFallback(prop, []);
    }

    return undefined;
  },
});

export default webDatabaseProxy;
