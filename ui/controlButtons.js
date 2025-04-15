// controlButtons.js: gestión de botones de control (pausa, detener, reanudar, cancelar)

export function createControlButtons(submitBtn, onPause, onStop, onResume, onCancel) {
  let pauseBtn = document.createElement('button');
  pauseBtn.type = 'button';
  pauseBtn.id = 'pauseBtn';
  pauseBtn.innerHTML = '<svg width="18" height="18" style="vertical-align:middle;margin-right:4px;" fill="#ff9800" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pausar';
  pauseBtn.style.background = '#ff9800';
  pauseBtn.style.color = '#fff';
  pauseBtn.style.border = 'none';
  pauseBtn.style.padding = '8px 16px';
  pauseBtn.style.borderRadius = '6px';
  pauseBtn.style.fontWeight = '600';
  pauseBtn.style.cursor = 'pointer';
  pauseBtn.style.marginRight = '10px';

  let stopBtn = document.createElement('button');
  stopBtn.type = 'button';
  stopBtn.id = 'stopBtn';
  stopBtn.innerHTML = '<svg width="18" height="18" style="vertical-align:middle;margin-right:4px;" fill="#f44336" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12"/></svg>Detener';
  stopBtn.style.background = '#f44336';
  stopBtn.style.color = '#fff';
  stopBtn.style.border = 'none';
  stopBtn.style.padding = '8px 16px';
  stopBtn.style.borderRadius = '6px';
  stopBtn.style.fontWeight = '600';
  stopBtn.style.cursor = 'pointer';

  let resumeBtn = document.createElement('button');
  resumeBtn.type = 'button';
  resumeBtn.id = 'resumeBtn';
  resumeBtn.innerHTML = '<svg width="18" height="18" style="vertical-align:middle;margin-right:4px;" fill="#43a047" viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19"/></svg>Reanudar';
  resumeBtn.style.background = '#43a047';
  resumeBtn.style.color = '#fff';
  resumeBtn.style.border = 'none';
  resumeBtn.style.padding = '8px 16px';
  resumeBtn.style.borderRadius = '6px';
  resumeBtn.style.fontWeight = '600';
  resumeBtn.style.cursor = 'pointer';
  resumeBtn.style.marginRight = '10px';

  let cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.id = 'cancelBtn';
  cancelBtn.innerHTML = '<svg width="18" height="18" style="vertical-align:middle;margin-right:4px;" fill="#f44336" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12"/></svg>Cancelar';
  cancelBtn.style.background = '#f44336';
  cancelBtn.style.color = '#fff';
  cancelBtn.style.border = 'none';
  cancelBtn.style.padding = '8px 16px';
  cancelBtn.style.borderRadius = '6px';
  cancelBtn.style.fontWeight = '600';
  cancelBtn.style.cursor = 'pointer';

  function showControlButtons(state = 'running') {
    submitBtn.style.display = 'none';
    [pauseBtn, stopBtn, resumeBtn, cancelBtn].forEach(b => b && b.remove());
    if (state === 'running') {
      submitBtn.parentNode.insertBefore(pauseBtn, submitBtn.nextSibling);
      submitBtn.parentNode.insertBefore(stopBtn, pauseBtn.nextSibling);
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    } else if (state === 'paused') {
      submitBtn.parentNode.insertBefore(resumeBtn, submitBtn.nextSibling);
      submitBtn.parentNode.insertBefore(cancelBtn, resumeBtn.nextSibling);
      resumeBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  }

  function restoreSubmitButton() {
    submitBtn.style.display = '';
    [pauseBtn, stopBtn, resumeBtn, cancelBtn].forEach(b => b && b.remove());
  }

  pauseBtn.onclick = onPause;
  stopBtn.onclick = onStop;
  resumeBtn.onclick = onResume;
  cancelBtn.onclick = onCancel;

  return { showControlButtons, restoreSubmitButton };
}
