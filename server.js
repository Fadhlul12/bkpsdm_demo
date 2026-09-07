const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads and data directories exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'db.json');

// Helper to read DB
function readDb() {
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  return {};
}

// Helper to write DB
function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// Set up file storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve Static Files
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// --- API ROUTES ---

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filePath = '/uploads/' + req.file.filename;
  res.json({ filePath: filePath, filename: req.file.originalname });
});

// Visitor Count APIs
app.get('/api/visitor', (req, res) => {
  const db = readDb();
  res.json({ count: db.visitorCount || 47820 });
});

app.post('/api/visitor/increment', (req, res) => {
  const db = readDb();
  db.visitorCount = (db.visitorCount || 47820) + 1;
  writeDb(db);
  res.json({ count: db.visitorCount });
});

// Pengumuman APIs
app.get('/api/pengumuman', (req, res) => {
  const db = readDb();
  res.json(db.pengumuman || []);
});

app.get('/api/pengumuman/:id', (req, res) => {
  const db = readDb();
  const list = db.pengumuman || [];
  const item = list.find(x => x.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
  }
});

app.post('/api/pengumuman', (req, res) => {
  const db = readDb();
  if (!db.pengumuman) db.pengumuman = [];
  
  const item = req.body;
  if (item.id) {
    const idx = db.pengumuman.findIndex(x => x.id === parseInt(item.id));
    if (idx !== -1) {
      db.pengumuman[idx] = { ...db.pengumuman[idx], ...item, id: parseInt(item.id) };
    } else {
      item.id = Date.now();
      db.pengumuman.push(item);
    }
  } else {
    item.id = Date.now();
    db.pengumuman.push(item);
  }
  writeDb(db);
  res.json({ success: true, data: item });
});

app.delete('/api/pengumuman/:id', (req, res) => {
  const db = readDb();
  if (db.pengumuman) {
    db.pengumuman = db.pengumuman.filter(x => x.id !== parseInt(req.params.id));
    writeDb(db);
  }
  res.json({ success: true });
});

// Pengumuman Categories APIs
const DEFAULT_PENGUMUMAN_CATS = [
  { id: 'cpns', name: 'CPNS/PPPK' },
  { id: 'kepangkatan', name: 'Kepangkatan' },
  { id: 'diklat', name: 'Pendidikan & Latihan' },
  { id: 'mutasi', name: 'Mutasi' },
  { id: 'pensiun', name: 'Pensiun' }
];

app.get('/api/pengumuman-categories', (req, res) => {
  const db = readDb();
  if (!db.pengumumanCategories || !db.pengumumanCategories.length) {
    db.pengumumanCategories = DEFAULT_PENGUMUMAN_CATS;
    writeDb(db);
  }
  res.json(db.pengumumanCategories);
});

app.post('/api/pengumuman-categories', (req, res) => {
  const db = readDb();
  if (!db.pengumumanCategories || !db.pengumumanCategories.length) {
    db.pengumumanCategories = [...DEFAULT_PENGUMUMAN_CATS];
  }
  const { id, name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama kategori harus diisi' });
  }

  const catId = (id && id.trim()) 
    ? id.trim().toLowerCase().replace(/\s+/g, '-')
    : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const existingIdx = db.pengumumanCategories.findIndex(c => c.id === catId);
  if (existingIdx !== -1) {
    db.pengumumanCategories[existingIdx].name = name.trim();
  } else {
    db.pengumumanCategories.push({ id: catId, name: name.trim() });
  }
  writeDb(db);
  res.json({ success: true, data: db.pengumumanCategories });
});

app.delete('/api/pengumuman-categories/:id', (req, res) => {
  const db = readDb();
  if (!db.pengumumanCategories) {
    db.pengumumanCategories = [...DEFAULT_PENGUMUMAN_CATS];
  }
  const catId = req.params.id;
  db.pengumumanCategories = db.pengumumanCategories.filter(c => c.id !== catId);
  writeDb(db);
  res.json({ success: true, data: db.pengumumanCategories });
});

// Kegiatan APIs
app.get('/api/kegiatan', (req, res) => {
  const db = readDb();
  res.json(db.kegiatan || []);
});

app.post('/api/kegiatan', (req, res) => {
  const db = readDb();
  if (!db.kegiatan) db.kegiatan = [];
  
  const item = req.body;
  if (item.id) {
    const idx = db.kegiatan.findIndex(x => x.id === parseInt(item.id));
    if (idx !== -1) {
      db.kegiatan[idx] = { ...db.kegiatan[idx], ...item, id: parseInt(item.id) };
    } else {
      item.id = Date.now();
      db.kegiatan.push(item);
    }
  } else {
    item.id = Date.now();
    db.kegiatan.push(item);
  }
  writeDb(db);
  res.json({ success: true, data: item });
});

app.delete('/api/kegiatan/:id', (req, res) => {
  const db = readDb();
  if (db.kegiatan) {
    db.kegiatan = db.kegiatan.filter(x => x.id !== parseInt(req.params.id));
    writeDb(db);
  }
  res.json({ success: true });
});

// Slides APIs
app.get('/api/slides', (req, res) => {
  const db = readDb();
  res.json(db.slides || []);
});

app.post('/api/slides', (req, res) => {
  const db = readDb();
  if (!db.slides) db.slides = [];
  
  const item = req.body;
  if (item.id) {
    const idx = db.slides.findIndex(x => x.id === parseInt(item.id));
    if (idx !== -1) {
      db.slides[idx] = { ...db.slides[idx], ...item, id: parseInt(item.id) };
    } else {
      item.id = Date.now();
      db.slides.push(item);
    }
  } else {
    item.id = Date.now();
    db.slides.push(item);
  }
  writeDb(db);
  res.json({ success: true, data: item });
});

app.delete('/api/slides/:id', (req, res) => {
  const db = readDb();
  if (db.slides) {
    db.slides = db.slides.filter(x => x.id !== parseInt(req.params.id));
    writeDb(db);
  }
  res.json({ success: true });
});

// Staf APIs
app.get('/api/staf', (req, res) => {
  const db = readDb();
  res.json(db.staf || []);
});

app.post('/api/staf', (req, res) => {
  const db = readDb();
  if (!db.staf) db.staf = [];
  
  const item = req.body;
  if (item.id) {
    const idx = db.staf.findIndex(x => x.id === parseInt(item.id));
    if (idx !== -1) {
      db.staf[idx] = { ...db.staf[idx], ...item, id: parseInt(item.id) };
    } else {
      item.id = Date.now();
      db.staf.push(item);
    }
  } else {
    item.id = Date.now();
    db.staf.push(item);
  }
  writeDb(db);
  res.json({ success: true, data: item });
});

app.delete('/api/staf/:id', (req, res) => {
  const db = readDb();
  if (db.staf) {
    db.staf = db.staf.filter(x => x.id !== parseInt(req.params.id));
    writeDb(db);
  }
  res.json({ success: true });
});

app.put('/api/staf/:id', (req, res) => {
  const db = readDb();
  if (!db.staf) db.staf = [];
  const id = parseInt(req.params.id);
  const item = req.body;
  const idx = db.staf.findIndex(x => x.id === id);
  if (idx !== -1) {
    db.staf[idx] = { ...db.staf[idx], ...item, id: id };
    writeDb(db);
    res.json({ success: true, data: db.staf[idx] });
  } else {
    res.status(404).json({ error: 'Staf not found' });
  }
});

// Layanan APIs
app.get('/api/layanan', (req, res) => {
  const db = readDb();
  res.json(db.layanan || []);
});

app.post('/api/layanan', (req, res) => {
  const db = readDb();
  if (!db.layanan) db.layanan = [];
  
  const item = req.body;
  if (item.id) {
    const idx = db.layanan.findIndex(x => x.id === item.id);
    if (idx !== -1) {
      db.layanan[idx] = { ...db.layanan[idx], ...item };
    } else {
      db.layanan.push(item);
    }
  } else {
    db.layanan.push(item);
  }
  writeDb(db);
  res.json({ success: true, data: item });
});

app.delete('/api/layanan/:id', (req, res) => {
  const db = readDb();
  if (db.layanan) {
    db.layanan = db.layanan.filter(x => x.id !== req.params.id);
    writeDb(db);
  }
  res.json({ success: true });
});

// Profil APIs
app.get('/api/profil', (req, res) => {
  const db = readDb();
  res.json(db.profil || {});
});

app.post('/api/profil', (req, res) => {
  const db = readDb();
  db.profil = { ...db.profil, ...req.body };
  writeDb(db);
  res.json({ success: true, data: db.profil });
});

// Kontak APIs
const DEFAULT_KONTAK = {
  alamat: "Jl. Tuanku Tambusai, Bagan Besar, Kec. Bukit Kapur, Kota Dumai, Riau 28825",
  telp: "(0765) 123-456",
  email: "bkpsdm@dumaikota.go.id",
  emailPenerima: "",
  jam: "Senin–Jumat, 08.00–16.00 WIB",
  mapIframeSrc: "https://maps.google.com/maps?q=BKPSDM%20Kota%20Dumai,%20Jl.%20Tuanku%20Tambusai,%20Bagan%20Besar,%20Kec.%20Bukit%20Kapur,%20Kota%20Dumai,%20Riau%2028825&t=&z=16&ie=UTF8&iwloc=&output=embed",
  fb: "#",
  ig: "#",
  yt: "#"
};

app.get('/api/kontak', (req, res) => {
  const db = readDb();
  res.json({ ...DEFAULT_KONTAK, ...(db.kontak || {}) });
});

app.post('/api/kontak', (req, res) => {
  const db = readDb();
  let mapSrc = (req.body.mapIframeSrc || '').trim();
  // Extract src if full <iframe src="..."> tag was pasted
  const iframeMatch = mapSrc.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    mapSrc = iframeMatch[1];
  }
  req.body.mapIframeSrc = mapSrc;

  db.kontak = { ...DEFAULT_KONTAK, ...(db.kontak || {}), ...req.body };
  writeDb(db);
  res.json({ success: true, data: db.kontak });
});

// Stats APIs
const DEFAULT_STATS = [
  { num: "3.412", lbl: "ASN Terdaftar" },
  { num: "8", lbl: "Pengumuman Bulan Ini" },
  { num: "14", lbl: "Jenis Layanan" },
  { num: "2–5", lbl: "Hari Kerja Proses Layanan" }
];

app.get('/api/stats', (req, res) => {
  const db = readDb();
  res.json(db.stats && db.stats.length ? db.stats : DEFAULT_STATS);
});

app.post('/api/stats', (req, res) => {
  const db = readDb();
  if (Array.isArray(req.body)) {
    db.stats = req.body;
    writeDb(db);
    res.json({ success: true, data: db.stats });
  } else {
    res.status(400).json({ error: 'Data stats harus berupa array' });
  }
});

// Alur APIs
app.get('/api/alur', (req, res) => {
  const db = readDb();
  res.json(db.alur || {});
});

app.post('/api/alur', (req, res) => {
  const db = readDb();
  db.alur = { ...db.alur, ...req.body };
  writeDb(db);
  res.json({ success: true, data: db.alur });
});

// Board (Papan Pengumuman) APIs
const DEFAULT_BOARD = {
  row1: "SKD DIMULAI 18 AGUSTUS",
  row2: "USULAN DIBUKA S/D 20 AGT",
  row3: "PENDAFTARAN DIKLATPIM XII",
  row4: "CEK STATUS MPP ANDA",
  tag1: "CPNS",
  tag2: "PANGKAT",
  tag3: "DIKLAT",
  tag4: "PENSIUN",
  updatedAt: null
};

app.get('/api/board', (req, res) => {
  const db = readDb();
  res.json(db.board || DEFAULT_BOARD);
});

app.post('/api/board', (req, res) => {
  const db = readDb();
  db.board = { ...DEFAULT_BOARD, ...db.board, ...req.body, updatedAt: new Date().toISOString() };
  writeDb(db);
  res.json({ success: true, data: db.board });
});

// Aplikasi APIs (Layanan Sistem Informasi ASN)
const DEFAULT_APLIKASI = [
  {
    id: 1,
    title: "SIASN",
    desc: "SIASN adalah Layanan Perencanaan Kebutuhan ASN.",
    url: "https://siasn.bkn.go.id",
    logo: ""
  },
  {
    id: 2,
    title: "Simpeg Kota Dumai",
    desc: "SIMPEG adalah Sistem Informasi Manajemen Kepegawaian. Sistem yang mengelola seluruh data pegawai di Pemerintahan Kota Dumai.",
    url: "https://simpeg.dumaikota.go.id",
    logo: "/uploads/logo-bkpsdm.jpg"
  },
  {
    id: 3,
    title: "SSCASN",
    desc: "SSCASN adalah Sistem Seleksi Calon ASN 2026.",
    url: "https://sscasn.bkn.go.id",
    logo: ""
  },
  {
    id: 4,
    title: "E-Kinerja",
    desc: "eKinerja adalah sistem online untuk mengelola kinerja ASN di Indonesia.",
    url: "https://kinerja.bkn.go.id",
    logo: ""
  },
  {
    id: 5,
    title: "MyASN",
    desc: "MyASN adalah Layanan perorangan ASN ditujukan untuk seluruh user ASN baik PNS maupun PPPK.",
    url: "https://myasn.bkn.go.id",
    logo: ""
  }
];

app.get('/api/aplikasi', (req, res) => {
  const db = readDb();
  if (!db.aplikasi || !db.aplikasi.length) {
    db.aplikasi = DEFAULT_APLIKASI;
    writeDb(db);
  }
  res.json(db.aplikasi);
});

app.post('/api/aplikasi', (req, res) => {
  const db = readDb();
  if (!db.aplikasi) db.aplikasi = [...DEFAULT_APLIKASI];
  
  const item = req.body;
  if (item.id && parseInt(item.id) !== -1) {
    const idx = db.aplikasi.findIndex(x => x.id === parseInt(item.id));
    if (idx !== -1) {
      db.aplikasi[idx] = { ...db.aplikasi[idx], ...item, id: parseInt(item.id) };
    } else {
      item.id = Date.now();
      db.aplikasi.push(item);
    }
  } else {
    item.id = Date.now();
    db.aplikasi.push(item);
  }
  writeDb(db);
  res.json({ success: true, data: item });
});

app.put('/api/aplikasi/:id', (req, res) => {
  const db = readDb();
  if (!db.aplikasi) db.aplikasi = [...DEFAULT_APLIKASI];
  const id = parseInt(req.params.id);
  const item = req.body;
  const idx = db.aplikasi.findIndex(x => x.id === id);
  if (idx !== -1) {
    db.aplikasi[idx] = { ...db.aplikasi[idx], ...item, id: id };
    writeDb(db);
    res.json({ success: true, data: db.aplikasi[idx] });
  } else {
    res.status(404).json({ error: 'Aplikasi not found' });
  }
});

app.delete('/api/aplikasi/:id', (req, res) => {
  const db = readDb();
  if (db.aplikasi) {
    db.aplikasi = db.aplikasi.filter(x => x.id !== parseInt(req.params.id));
    writeDb(db);
  }
  res.json({ success: true });
});


// Catch-all route to serve index.html for undefined routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SIPADU Local Backend Server is running at http://localhost:${PORT}`);
});
