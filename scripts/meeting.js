(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const get = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj);
  const esc = (value) => String(value ?? '—')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const pillClass = (status = '') => {
    const s = status.toLowerCase();
    if (/(concluído|disponível|normal|executado)/.test(s)) return 'pill-green';
    if (/(reprogramado|em andamento|verificar|agendado)/.test(s)) return 'pill-amber';
    if (/(crítico|atrasado|vencido|indisponível)/.test(s)) return 'pill-red';
    if (/(planejado|programado|em aquisição)/.test(s)) return 'pill-blue';
    return 'pill-gray';
  };

  const statusPill = (status) => `<span class="pill ${pillClass(status)}">${esc(status)}</span>`;
  const priorityBadge = (priority) => `<span class="priority ${String(priority).toLowerCase()}">${esc(priority)}</span>`;

  const setRows = (id, rows, cols) => {
    const tbody = document.getElementById(id);
    if (!tbody) return;
    if (!rows?.length) {
      tbody.innerHTML = `<tr><td colspan="${cols.length}" class="empty">Nenhum registro para esta semana.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(row => `<tr>${cols.map(fn => `<td>${fn(row)}</td>`).join('')}</tr>`).join('');
  };

  const setList = (id, items) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = (items?.length ? items : ['Nenhum item registrado.'])
      .map(item => `<li>${esc(item)}</li>`).join('');
  };

  const setProgress = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    const n = Math.max(0, Math.min(100, Number(value) || 0));
    el.style.width = `${n}%`;
  };

  async function loadMeeting() {
    const response = await fetch('data/meeting.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Falha ao carregar meeting.json (${response.status})`);
    return response.json();
  }

  function render(data) {
    $$('[data-bind]').forEach(el => {
      const value = get(data, el.dataset.bind);
      el.textContent = value ?? '—';
    });

    setList('safety-alerts', data.safety?.alerts);
    setList('look-30', data.lookAhead?.d30);
    setList('look-60', data.lookAhead?.d60);
    setList('look-90', data.lookAhead?.d90);

    setRows('previous-table', data.previous?.activities, [
      r => esc(r.activity),
      r => esc(r.asset),
      r => esc(r.owner),
      r => statusPill(r.status),
      r => `<span class="muted">${esc(r.note)}</span>`
    ]);

    setRows('anomaly-table', data.anomalies, [
      r => priorityBadge(r.priority),
      r => esc(r.description),
      r => esc(r.asset),
      r => statusPill(r.status),
      r => esc(r.nextAction),
      r => esc(r.owner)
    ]);

    setRows('schedule-table', data.schedule, [
      r => esc(r.date),
      r => esc(r.activity),
      r => `<span class="muted">${esc(r.type)}</span>`,
      r => esc(r.asset),
      r => esc(r.owner),
      r => statusPill(r.status)
    ]);

    setRows('maintenance-table', data.maintenance?.items, [
      r => esc(r.asset),
      r => esc(r.service),
      r => esc(r.due),
      r => statusPill(r.status),
      r => esc(r.owner)
    ]);

    setRows('materials-table', data.materials, [
      r => esc(r.item),
      r => esc(r.need),
      r => statusPill(r.status)
    ]);

    setRows('thirdparty-table', data.thirdParty, [
      r => esc(r.demand),
      r => esc(r.nextAction),
      r => esc(r.owner)
    ]);

    setRows('actions-table', data.actions, [
      r => esc(r.id),
      r => esc(r.action),
      r => esc(r.owner),
      r => esc(r.due),
      r => priorityBadge(r.priority),
      r => statusPill(r.status)
    ]);

    const anomalies = data.anomalies || [];
    ['P1','P2','P3','P4'].forEach(p => {
      const el = document.getElementById(`count-${p.toLowerCase()}`);
      if (el) el.textContent = anomalies.filter(a => a.priority === p).length;
    });

    const totalSchedule = data.schedule?.length || 0;
    const criticalSchedule = (data.schedule || []).filter(x => x.critical).length;
    const ownedSchedule = (data.schedule || []).filter(x => x.owner && x.owner.trim()).length;
    if ($('#schedule-total')) $('#schedule-total').textContent = totalSchedule;
    if ($('#schedule-critical')) $('#schedule-critical').textContent = criticalSchedule;
    if ($('#schedule-owned')) $('#schedule-owned').textContent = ownedSchedule;

    if ($('#anomalies-open')) $('#anomalies-open').textContent = anomalies.length;
    if ($('#high-priority-open')) $('#high-priority-open').textContent = anomalies.filter(a => ['P1','P2'].includes(a.priority)).length;

    setProgress('previous-progress', data.previous?.compliance);
    setProgress('indicator-compliance', data.previous?.compliance);
    setProgress('indicator-availability', data.indicators?.availability);
  }

  function showError(err) {
    console.error(err);
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;left:20px;bottom:20px;z-index:9999;background:#8f302d;color:white;padding:12px 16px;border-radius:10px;font:14px Segoe UI,Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25)';
    banner.textContent = 'Não foi possível carregar data/meeting.json. Verifique o arquivo e publique novamente.';
    document.body.appendChild(banner);
  }

  const boot = () => loadMeeting().then(render).catch(showError);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
