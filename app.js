// Fetch and display data from data.json
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    renderTable(data.records);
    document.getElementById('download-json').addEventListener('click', () => downloadJSON(data));
    document.getElementById('download-csv').addEventListener('click', () => downloadCSV(data.records));
  } catch (err) {
    document.getElementById('table-container').textContent = 'Error loading data: ' + err.message;
  }
}

// Render records as an HTML table (using DOM methods to avoid XSS)
function renderTable(records) {
  const container = document.getElementById('table-container');
  if (!records || records.length === 0) {
    container.textContent = 'No data available.';
    return;
  }
  const headers = Object.keys(records[0]);
  const table = document.createElement('table');

  // Header row
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });

  // Data rows
  const tbody = table.createTBody();
  records.forEach(row => {
    const tr = tbody.insertRow();
    headers.forEach(h => {
      const td = tr.insertCell();
      td.textContent = row[h];
    });
  });

  container.innerHTML = '';
  container.appendChild(table);
}

// Download data as a JSON file
function downloadJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, 'wheel-data.json');
}

// Escape a single CSV field: wrap in quotes if it contains comma, quote, or newline;
// double any internal double-quotes.
function escapeCSVField(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Download records as a CSV file
function downloadCSV(records) {
  if (!records || records.length === 0) return;
  const headers = Object.keys(records[0]);
  const rows = records.map(r => headers.map(h => escapeCSVField(r[h])).join(','));
  const csv = [headers.map(escapeCSVField).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  triggerDownload(blob, 'wheel-data.csv');
}

// Create a temporary anchor element to trigger a file download
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', loadData);
