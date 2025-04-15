// bodyProcessing.js: funciones para procesar el body del formulario

export function processBody(bodyStr) {
    if (!bodyStr?.trim()) return null;
    try {
        return JSON.parse(bodyStr);
    } catch {
        alert('El body JSON no es válido');
        throw new Error('JSON inválido');
    }
}
