const fs = require('fs');
const path = require('path');

async function main() {
  const lines = fs.readFileSync(path.join(__dirname, '..', 'admin-credentials.txt'), 'utf8').trim().split(/\r?\n/);
  const email = lines[0].slice('Email: '.length);
  const password = lines[1].slice('Password: '.length);
  const base = process.env.API_URL || 'https://campusfind-api.vercel.app/api';
  const login = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!login.ok) throw new Error(`Admin login failed (${login.status})`);
  const { token, user } = await login.json();
  if (user.role !== 'admin') throw new Error('Admin role missing in login response.');
  const overview = await fetch(`${base}/admin/overview`, { headers: { Authorization: `Bearer ${token}` } });
  if (!overview.ok) throw new Error(`Admin overview failed (${overview.status})`);
  const summary = await overview.json();
  const photo = fs.readFileSync(path.join(__dirname, '..', '..', 'mobile', 'assets', 'icon.png'));
  const form = new FormData();
  form.append('image', new Blob([photo], { type: 'image/png' }), 'campusfind-icon.png');
  const upload = await fetch(`${base}/auth/me/avatar`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  if (!upload.ok) throw new Error(`Avatar upload failed (${upload.status}): ${await upload.text()}`);
  const updated = await upload.json();
  const image = await fetch(`${base.replace(/\/api$/, '')}${updated.user.avatarUrl}`);
  if (!image.ok || image.headers.get('content-type') !== 'image/png') throw new Error('Uploaded photo was not served correctly.');
  const created = await fetch(`${base}/items`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Upload verification item', description: 'Temporary item to verify image uploads.', category: 'Other', foundLocation: 'Campus testing', foundDate: new Date().toISOString().slice(0, 10) }) });
  if (!created.ok) throw new Error(`Test item creation failed (${created.status})`);
  const { item } = await created.json();
  try {
    const imageForm = new FormData();
    imageForm.append('image', new Blob([fs.readFileSync(path.join(__dirname, '..', '..', 'mobile', 'assets', 'demo', 'keys.png'))], { type: 'image/png' }), 'keys.png');
    const itemUpload = await fetch(`${base}/items/${item._id}/image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: imageForm });
    if (!itemUpload.ok) throw new Error(`Item photo upload failed (${itemUpload.status}): ${await itemUpload.text()}`);
    const saved = await itemUpload.json();
    const served = await fetch(saved.item.imageUrl);
    if (!served.ok || served.headers.get('content-type') !== 'image/png') throw new Error('Item photo was not served correctly.');
  } finally { await fetch(`${base}/items/${item._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); }
  console.log(`Verified admin login, dashboard (${summary.users} users), profile and item photo uploads.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => process.exit(process.exitCode || 0));
