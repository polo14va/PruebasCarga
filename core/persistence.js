// persistence.js: funciones para guardar y restaurar valores de localStorage

export function restoreFieldFromStorage(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const saved = localStorage.getItem(key);
    if (saved !== null) {
        if (el.type === 'number') el.value = Number(saved);
        else el.value = saved;
    }
}

export function persistFieldToStorage(id, key, extraCallback) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
        localStorage.setItem(key, el.value);
        if (typeof extraCallback === 'function') extraCallback();
    });
}

export function restoreManualJson(textAreaId, storageKey) {
    const el = document.getElementById(textAreaId);
    if (!el) return;
    const saved = localStorage.getItem(storageKey);
    if (saved && el) el.value = saved;
}

export function persistManualJson(textAreaId, storageKey) {
    const el = document.getElementById(textAreaId);
    if (!el) return;
    el.addEventListener('input', () => {
        localStorage.setItem(storageKey, el.value);
    });
}

export function restoreUniqueNumber(inputId, storageKey) {
    const el = document.getElementById(inputId);
    if (!el) return 1;
    let uniqueNumber = parseInt(localStorage.getItem(storageKey), 10) || 1;
    el.value = uniqueNumber;
    return uniqueNumber;
}

export function persistUniqueNumber(inputId, storageKey) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('input', () => {
        localStorage.setItem(storageKey, el.value);
    });
}
