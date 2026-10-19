'use strict';

const state = { overview: null, view: 'overview', loading: false };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const VIEW_CONFIG = {
  overview: { title: 'Tổng quan hệ thống', heading: 'Tài nguyên gần đây', subtitle: 'Theo dõi tài nguyên Cloudflare trong một bảng điều khiển tập trung.', description: 'Danh mục tài nguyên có thể đọc từ Cloudflare API.' },
  workers: { title: 'Workers', heading: 'Worker scripts', subtitle: 'Danh mục các Worker scripts trong tài khoản Cloudflare.', description: 'Tên và metadata an toàn của Worker scripts. Các thao tác thay đổi được giữ ngoài dashboard trong bản phát hành này.' },
  databases: { title: 'D1 Databases', heading: 'D1 databases', subtitle: 'Danh mục cơ sở dữ liệu D1 được tài khoản Cloudflare quản lý.', description: 'Metadata cơ sở dữ liệu; không hiển thị dữ liệu hàng hoặc nội dung bí mật.' },
  kvNamespaces: { title: 'KV Namespaces', heading: 'KV namespaces', subtitle: 'Danh mục kho key-value của tài khoản Cloudflare.', description: 'Metadata namespace; không đọc hoặc hiển thị giá trị key-value.' }
};

function setVisible(selector, visible) { $(selector).classList.toggle('hidden', !visible); }
function setText(selector, value) { $(selector).textContent = value == null || value === '' ? '—' : String(value); }
function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
function formatBytes(value) {
  if (!Number.isFinite(value) || value < 0) return '—';
  if (value === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / (1024 ** index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
function currentResource() {
  const r = state.overview?.resources;
  if (!r) return { items: [], status: 'error', error: 'Chưa tải được dữ liệu.' };
  if (state.view === 'overview') {
    const merged = [];
    for (const [key, collection] of Object.entries(r)) {
      for (const item of collection.items || []) merged.push({ ...item, _resourceType: key });
    }
    merged.sort((a, b) => String(b.modifiedOn || b.createdAt || '').localeCompare(String(a.modifiedOn || a.createdAt || '')));
    return { items: merged.slice(0, 12), status: Object.values(r).every((x) => x.status === 'ok') ? 'ok' : 'partial' };
  }
  return r[state.view] || { items: [], status: 'error', error: 'Nguồn dữ liệu không được hỗ trợ.' };
}
function typeLabel(key) {
  return key === 'workers' ? 'Worker' : key === 'databases' ? 'D1 Database' : key === 'kvNamespaces' ? 'KV Namespace' : 'Cloudflare resource';
}
function itemMeta(item, type) {
  if (type === 'workers') return `Sửa đổi: ${formatDate(item.modifiedOn)} · Compatibility: ${item.compatibilityDate || '—'}`;
  if (type === 'databases') return `Tạo: ${formatDate(item.createdAt)} · Tables: ${item.numTables ?? '—'} · Size: ${formatBytes(item.fileSize)}`;
  if (type === 'kvNamespaces') return `ID: ${item.id || '—'} · URL encoding: ${item.supportsUrlEncoding ? 'Có' : 'Không'}`;
  if (item._resourceType === 'workers') return `Sửa đổi: ${formatDate(item.modifiedOn)}`;
  if (item._resourceType === 'databases') return `Tạo: ${formatDate(item.createdAt)} · Tables: ${item.numTables ?? '—'}`;
  return `ID: ${item.id || item.uuid || '—'}`;
}
function itemName(item, type) {
  if (type === 'workers' || item._resourceType === 'workers') return item.id || '(Worker chưa có tên)';
  if (type === 'databases' || item._resourceType === 'databases') return item.name || '(D1 database chưa có tên)';
  return item.title || '(KV namespace chưa có tên)';
}
function itemId(item, type) {
  if (type === 'workers' || item._resourceType === 'workers') return item.id || '—';
  return item.uuid || item.id || '—';
}
function iconType(item, type) {
  const actual = type || item._resourceType;
  if (actual === 'workers') return { className: '', glyph: '⌘' };
  if (actual === 'databases') return { className: 'd1', glyph: '▤' };
  return { className: 'kv', glyph: '▦' };
}
function showError(message) {
  const el = $('#page-error');
  el.textContent = message;
  el.classList.remove('hidden');
}
function clearError() { setVisible('#page-error', false); }

async function fetchOverview() {
  const response = await fetch('/api/overview', { method: 'GET', credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401 || response.status === 403) {
    const error = new Error(payload.error || 'Access authentication required');
    error.auth = true;
    throw error;
  }
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function updateMetrics() {
  const overview = state.overview;
  if (!overview) return;
  setText('#metric-workers', overview.totals?.workers ?? 0);
  setText('#metric-d1', overview.totals?.databases ?? 0);
  setText('#metric-kv', overview.totals?.kvNamespaces ?? 0);
  setText('#nav-workers-count', overview.totals?.workers ?? 0);
  setText('#nav-d1-count', overview.totals?.databases ?? 0);
  setText('#nav-kv-count', overview.totals?.kvNamespaces ?? 0);
  setText('#account-id', overview.account?.id || 'Chưa cấu hình');
  setText('#last-updated', `Cập nhật ${formatDate(overview.generatedAt)}`);
}

function createCell(text, className = '') {
  const td = document.createElement('td');
  if (className) td.className = className;
  td.textContent = text == null || text === '' ? '—' : String(text);
  return td;
}

function renderTable() {
  const tbody = $('#resource-table-body');
  tbody.replaceChildren();
  const collection = currentResource();
  const config = VIEW_CONFIG[state.view];
  const type = state.view === 'overview' ? null : state.view;
  const query = $('#resource-search').value.trim().toLowerCase();
  const items = (collection.items || []).filter((item) => `${itemName(item, type)} ${itemMeta(item, type)} ${itemId(item, type)}`.toLowerCase().includes(query));
  setText('#resource-heading', config.heading);
  setText('#resource-description', config.description);
  setText('#breadcrumb-current', config.title);
  setText('#page-title', config.title);
  setText('#page-subtitle', config.subtitle);
  const head = $('#resource-table-head');
  head.replaceChildren();
  const columns = ['TÊN TÀI NGUYÊN', 'LOẠI', 'CHI TIẾT', 'TRẠNG THÁI'];
  const headerRow = document.createElement('tr');
  columns.forEach((label) => { const th = document.createElement('th'); th.textContent = label; headerRow.append(th); });
  head.append(headerRow);

  if (!items.length) {
    const tr = document.createElement('tr');
    const td = createCell(query ? 'Không tìm thấy tài nguyên phù hợp.' : (collection.status === 'error' ? 'Không thể tải tài nguyên. Kiểm tra token và quyền Cloudflare API.' : 'Chưa có tài nguyên trong danh sách.'), 'empty-cell');
    td.colSpan = 4;
    tr.append(td);
    tbody.append(tr);
  } else {
    for (const item of items) {
      const actualType = type || item._resourceType;
      const info = iconType(item, actualType);
      const tr = document.createElement('tr');
      const nameCell = document.createElement('td');
      const nameWrap = document.createElement('div'); nameWrap.className = 'resource-name';
      const icon = document.createElement('span'); icon.className = `resource-icon ${info.className}`; icon.textContent = info.glyph;
      const textWrap = document.createElement('div');
      const name = document.createElement('strong'); name.textContent = itemName(item, type);
      const id = document.createElement('small'); id.textContent = `ID: ${itemId(item, type)}`;
      textWrap.append(name, id); nameWrap.append(icon, textWrap); nameCell.append(nameWrap);
      tr.append(nameCell);
      const pillCell = document.createElement('td'); const pill = document.createElement('span'); pill.className = 'type-pill'; pill.textContent = typeLabel(actualType); pillCell.append(pill); tr.append(pillCell);
      tr.append(createCell(itemMeta(item, type)));
      const statusCell = document.createElement('td'); const status = document.createElement('span');
      const resourceStatus = type ? collection.status : state.overview.resources[actualType]?.status;
      status.className = `status-pill ${resourceStatus === 'ok' ? 'ok' : 'error'}`;
      status.textContent = resourceStatus === 'ok' ? 'Đã đồng bộ' : (resourceStatus === 'not_configured' ? 'Chưa cấu hình' : 'Lỗi nguồn dữ liệu');
      statusCell.append(status); tr.append(statusCell); tbody.append(tr);
    }
  }
  setText('#result-count', `${items.length} tài nguyên${query ? ' phù hợp' : ''}`);
  const notice = $('#resource-notice');
  if (collection.status !== 'ok' && collection.status !== 'partial') {
    notice.textContent = collection.error || 'Một hoặc nhiều nguồn dữ liệu không phản hồi. Hãy kiểm tra quyền token chỉ đọc.';
    notice.classList.remove('hidden');
  } else if (state.overview?.warnings?.length) {
    notice.textContent = 'Một phần dữ liệu chưa sẵn sàng hoặc đã chạm giới hạn phân trang. Kiểm tra quyền Workers Scripts Read, D1 Read và KV Storage Read của token.';
    notice.classList.remove('hidden');
  } else {
    notice.classList.add('hidden');
  }
}

function showDashboard() {
  setVisible('#page-loading', false);
  setVisible('#auth-required', false);
  setVisible('#dashboard-content', true);
  updateMetrics();
  renderTable();
}

async function loadOverview({ quiet = false } = {}) {
  if (state.loading) return;
  state.loading = true;
  clearError();
  $('#refresh-button').classList.add('loading');
  if (!state.overview || !quiet) setVisible('#page-loading', true);
  try {
    state.overview = await fetchOverview();
    setVisible('#page-loading', false);
    setVisible('#auth-required', false);
    setVisible('#dashboard-content', true);
    showDashboard();
  } catch (error) {
    setVisible('#page-loading', false);
    setVisible('#dashboard-content', false);
    if (error.auth) {
      setVisible('#auth-required', true);
    } else {
      setVisible('#auth-required', false);
      showError(`${error.message}. Hãy kiểm tra cấu hình Cloudflare Access và token API chỉ đọc.`);
    }
  } finally {
    state.loading = false;
    $('#refresh-button').classList.remove('loading');
  }
}

function setView(view) {
  if (!VIEW_CONFIG[view]) return;
  state.view = view;
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  $('#resource-search').value = '';
  renderTable();
}

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
function exportCsv() {
  const collection = currentResource();
  const type = state.view === 'overview' ? null : state.view;
  const query = $('#resource-search').value.trim().toLowerCase();
  const rows = [['name', 'type', 'id', 'details', 'status']];
  (collection.items || []).filter((item) => `${itemName(item, type)} ${itemMeta(item, type)} ${itemId(item, type)}`.toLowerCase().includes(query)).forEach((item) => {
    const itemType = type || item._resourceType;
    const status = type ? collection.status : state.overview.resources[itemType]?.status;
    rows.push([itemName(item, type), typeLabel(itemType), itemId(item, type), itemMeta(item, type), status || 'unknown']);
  });
  const csv = '\uFEFF' + rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `hendy-cloudflare-${state.view}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
}

$$('.nav-item').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
$('#refresh-button').addEventListener('click', () => loadOverview());
$('#retry-auth').addEventListener('click', () => loadOverview());
$('#resource-search').addEventListener('input', renderTable);
$('#export-button').addEventListener('click', exportCsv);
loadOverview();
