// initApp.js: Inicialización y wiring de la aplicación
import { updateTotalRequestsCalc, updateUI } from '../ui/ui.js';
import { exportLoadTestPDF } from './pdfExport.js';
import { restoreFieldFromStorage, persistFieldToStorage, restoreManualJson, persistManualJson, restoreUniqueNumber, persistUniqueNumber } from './persistence.js';
import { processBody } from './bodyProcessing.js';
import { LoadTestConfig } from '../models/LoadTestConfig.js';
import { LoadTestResult } from '../models/LoadTestResult.js';
import { LoadTester } from './LoadTester.js';

export function initApp() {
  window.addEventListener('DOMContentLoaded', () => {
    // PDF y logs
    const pdfBtn = document.getElementById('downloadPdfBtn');
    if (pdfBtn) pdfBtn.addEventListener('click', exportLoadTestPDF);
    // Botones de logs OK/KO
    const koLogBtn = document.getElementById('downloadKoLogBtn');
    if (koLogBtn) {
      koLogBtn.addEventListener('click', () => {
        const log = window.lastKOPetitionLog;
        if (log && Array.isArray(log) && log.length) {
          const blob = new Blob([JSON.stringify(log, null, 2)], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ko_log.json';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        } else {
          alert('No hay peticiones KO registradas.');
        }
      });
    }
    const okLogBtn = document.createElement('button');
    okLogBtn.id = 'downloadOkLogBtn';
    okLogBtn.textContent = 'Descargar log OK';
    okLogBtn.style.background = '#4caf50';
    okLogBtn.style.color = '#fff';
    okLogBtn.style.border = 'none';
    okLogBtn.style.padding = '8px 16px';
    okLogBtn.style.borderRadius = '6px';
    okLogBtn.style.fontWeight = '600';
    okLogBtn.style.cursor = 'pointer';
    okLogBtn.style.boxShadow = '0 2px 8px #4caf5033';
    okLogBtn.style.marginLeft = '10px';
    const pdfBtnParent = pdfBtn?.parentNode;
    if (pdfBtnParent && pdfBtn) {
      pdfBtnParent.insertBefore(okLogBtn, koLogBtn?.nextSibling || pdfBtn.nextSibling);
    }
    okLogBtn.addEventListener('click', () => {
      const log = window.lastOKPetitionLog;
      if (log && Array.isArray(log) && log.length) {
        const blob = new Blob([JSON.stringify(log, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ok_log.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      } else {
        alert('No hay peticiones OK registradas.');
      }
    });
    updateTotalRequestsCalc();
    updateUI();

    // Persistencia de campos
    const persistFields = [
      { id: 'authUrl', key: 'loadtest_auth_url' },
      { id: 'authHeaders', key: 'loadtest_auth_headers' },
      { id: 'authBody', key: 'loadtest_auth_body' },
      { id: 'url', key: 'loadtest_url' },
      { id: 'threads', key: 'loadtest_threads' },
      { id: 'requests', key: 'loadtest_requests' },
      { id: 'replaceTokenString', key: 'loadtest_replace_token_string' },
      { id: 'replaceTokenStart', key: 'loadtest_replace_token_start' }
    ];
    persistFields.forEach(({id, key}) => {
      restoreFieldFromStorage(id, key);
      persistFieldToStorage(id, key, (id === 'threads' || id === 'requests') ? updateTotalRequestsCalc : undefined);
    });

    // Manual JSON
    restoreManualJson('jsonTextArea', 'loadtest_manual_json');
    persistManualJson('jsonTextArea', 'loadtest_manual_json');

    // Número incremental
    restoreUniqueNumber('replaceTokenStart', 'loadtest_unique_number');
    persistUniqueNumber('replaceTokenStart', 'loadtest_unique_number');

    // Mostrar/ocultar campos de token según URL
    const authUrl = document.getElementById('authUrl');
    const authHeaders = document.getElementById('authHeaders');
    const authHeadersLabel = document.querySelector('label[for="authHeaders"]');
    const authBody = document.getElementById('authBody');
    const authBodyLabel = document.querySelector('label[for="authBody"]');
    function toggleTokenFields() {
      const show = !!authUrl.value.trim();
      if (authHeaders) authHeaders.style.display = show ? '' : 'none';
      if (authHeadersLabel) authHeadersLabel.style.display = show ? '' : 'none';
      if (authBody) authBody.style.display = show ? '' : 'none';
      if (authBodyLabel) authBodyLabel.style.display = show ? '' : 'none';
    }
    if (authUrl) {
      authUrl.addEventListener('input', toggleTokenFields);
      toggleTokenFields(); // Inicial
    }

    // Persistencia del checkbox de reemplazo incremental
    const replaceTokenCheck = document.getElementById('replaceTokenCheck');
    const LS_REPLACE_CHECKED = 'loadtest_replace_checked';
    // Restaurar al cargar
    const savedReplaceChecked = localStorage.getItem(LS_REPLACE_CHECKED);
    if (savedReplaceChecked !== null) {
      replaceTokenCheck.checked = savedReplaceChecked === 'true';
    }
    // Guardar cambios
    replaceTokenCheck.addEventListener('change', () => {
      localStorage.setItem(LS_REPLACE_CHECKED, replaceTokenCheck.checked);
    });

    // Mostrar/ocultar file o textarea
    const jsonFileInput = document.getElementById('jsonFile');
    const jsonTextArea = document.getElementById('jsonTextArea');
    const bodySourceFile = document.getElementById('bodySourceFile');
    const bodySourceText = document.getElementById('bodySourceText');
    function updateReplaceBlockVisibility() {
      let show = false;
      if (bodySourceFile.checked && jsonFileInput.files.length > 0) show = true;
      if (bodySourceText.checked && jsonTextArea.value.trim()) show = true;
      const replaceBlock = replaceTokenCheck.closest('div');
      if (replaceBlock) replaceBlock.style.display = show ? '' : 'none';
    }
    bodySourceFile.addEventListener('change', () => {
      document.getElementById('jsonFileGroup').style.display = '';
      document.getElementById('jsonTextAreaGroup').style.display = 'none';
      updateReplaceBlockVisibility();
    });
    bodySourceText.addEventListener('change', () => {
      document.getElementById('jsonFileGroup').style.display = 'none';
      document.getElementById('jsonTextAreaGroup').style.display = '';
      updateReplaceBlockVisibility();
    });
    const bodySourceNone = document.getElementById('bodySourceNone');
    bodySourceNone.addEventListener('change', () => {
      document.getElementById('jsonFileGroup').style.display = 'none';
      document.getElementById('jsonTextAreaGroup').style.display = 'none';
      const replaceBlock = replaceTokenCheck.closest('div');
      if (replaceBlock) replaceBlock.style.display = 'none';
    });
    jsonFileInput.addEventListener('change', updateReplaceBlockVisibility);
    jsonTextArea.addEventListener('input', updateReplaceBlockVisibility);
    updateReplaceBlockVisibility();
    if (bodySourceText.checked) {
      document.getElementById('jsonFileGroup').style.display = 'none';
      document.getElementById('jsonTextAreaGroup').style.display = '';
    } else if (bodySourceFile.checked) {
      document.getElementById('jsonFileGroup').style.display = '';
      document.getElementById('jsonTextAreaGroup').style.display = 'none';
    } else if (bodySourceNone.checked) {
      document.getElementById('jsonFileGroup').style.display = 'none';
      document.getElementById('jsonTextAreaGroup').style.display = 'none';
      const replaceBlock = replaceTokenCheck.closest('div');
      if (replaceBlock) replaceBlock.style.display = 'none';
    }

    // Formulario principal
    const form = document.getElementById('loadTestForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    // Importar helper de control de botones
    import('../ui/controlButtons.js').then(({ createControlButtons }) => {
      const { showControlButtons, restoreSubmitButton } = createControlButtons(
        submitBtn,
        () => { // onPause
          if (window.currentLoadTester) {
            window.currentLoadTester.paused = true;
            window.currentLoadTester.running = false;
            updateUI(true);
            showControlButtons('paused');
          }
        },
        () => { // onStop
          if (window.currentLoadTester) {
            window.currentLoadTester.running = false;
            window.currentLoadTester.paused = false;
            updateUI(true);
            restoreSubmitButton();
          }
        },
        () => { // onResume
          if (window.currentLoadTester) {
            window.currentLoadTester.paused = false;
            window.currentLoadTester.running = true;
            window.currentLoadTester.resume && window.currentLoadTester.resume();
            showControlButtons('running');
          }
        },
        () => { // onCancel
          if (window.currentLoadTester) {
            window.currentLoadTester.running = false;
            window.currentLoadTester.paused = false;
            updateUI(true);
            restoreSubmitButton();
          }
        }
      );
      window.showControlButtons = showControlButtons;
      window.restoreSubmitButton = restoreSubmitButton;
      function showProgressSection() {
        const el = document.getElementById('progressSection');
        if (el) el.classList.remove('hidden');
      }

      let uniqueNumber = parseInt(localStorage.getItem('loadtest_unique_number'), 10) || 1;
form.addEventListener('submit', function(event) {
        event.preventDefault();
        showProgressSection();
        updateUI(); // Fuerza donut en 0% antes de lanzar la prueba
        showControlButtons();
        let jsonData = null;
        let bodyStr = '';
        if (bodySourceFile.checked) {
          const file = jsonFileInput.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
              bodyStr = e.target.result;
              finishSubmit();
            };
            reader.readAsText(file);
            return;
          } else {
            bodyStr = '';
          }
        } else if (bodySourceText.checked) {
          bodyStr = jsonTextArea.value;
        }
        finishSubmit();

        function finishSubmit() {
          if (!bodyStr?.trim()) jsonData = null;
          else jsonData = processBody(bodyStr);

          // Leer valores del formulario
          const url = document.getElementById('url').value;
          const threadsInput = document.getElementById('threads');
const threads = threadsInput && threadsInput.value ? parseInt(threadsInput.value, 10) : 1;
          const requestsInput = document.getElementById('requests');
const requests = requestsInput && requestsInput.value ? parseInt(requestsInput.value, 10) : 1;
          const totalRequests = threads * requests;
          const bearerToken = null; // Puedes obtenerlo del formulario si es necesario

          // Configuración para reemplazo incremental
          let replaceActive = replaceTokenCheck.checked;
          let replaceStr = replaceTokenString.value;
          let startNum = parseInt(replaceTokenStart.value, 10) || 1;
          let currentNum = uniqueNumber = startNum;
          localStorage.setItem('loadtest_unique_number', uniqueNumber);

          // Crear configuración y resultado
          const config = new LoadTestConfig(url, jsonData, threads, totalRequests, bearerToken);
          config.requestsPerThread = requests;
          const result = new LoadTestResult(threads);
          window.currentLoadTestResult = result;

          // Crear y ejecutar el tester
          const tester = new LoadTester(config, result, updateUI, () => {
            updateUI(true);
            restoreSubmitButton();
            localStorage.setItem('loadtest_unique_number', uniqueNumber);
          });
          window.currentLoadTester = tester;

          // Hook para reemplazo incremental
          if (replaceActive && replaceStr) {
            tester.onBeforeRequest = (body, reqIndex) => {
              let replaced = JSON.stringify(body).replaceAll(replaceStr, currentNum);
              currentNum++;
              uniqueNumber = currentNum;
              localStorage.setItem('loadtest_unique_number', uniqueNumber);
              return JSON.parse(replaced);
            };
          }
          tester.start();
        }
      });
    });
  });
}
