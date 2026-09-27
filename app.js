// Tugas 1 - RESTful API Murni dengan Express.js
// Topik 34 - Streaming: Serial TV
// Nama: M. Fadhil Anhar
// NPM: 2428240158  

// impor express
const express = require("express");
const app = express();

// middleware untuk membaca body JSON (Content-Type: application/json)
app.use(express.json());

// port server: dari environment (Vercel) atau default 3000
const PORT = process.env.PORT || 3000;

// ======================================================
// DATA DI MEMORI (tidak pakai database)
// minimal 3 data awal sesuai instruksi
// ======================================================
let tvSeries = [
  {
    id: 1,
    judul: "Rahasia Kampus Tua",
    jumlahEpisode: 12,
    status: "tamat",
    studio: "Layar Kita",
    tahunRilis: 2025,
  },
  {
    id: 2,
    judul: "Detektif Malam",
    jumlahEpisode: 8,
    status: "tayang",
    studio: "Cahaya Visual",
    tahunRilis: 2026,
  },
  {
    id: 3,
    judul: "Jejak Kota Lama",
    jumlahEpisode: 20,
    status: "tamat",
    studio: "Nusantara Pictures",
    tahunRilis: 2023,
  },
];

// id berikutnya untuk data baru (dibuat otomatis oleh server)
let nextId = 4;

// ======================================================
// GET / -> info API (nama mahasiswa, NIM, topik, daftar endpoint)
// ======================================================
app.get("/", (req, res) => {
  res.json({
    nama: "M. Fadhil Anhar",
    nim: "ISI_NIM_ANDA",
    topik: "34 - Streaming: Serial TV",
    endpoints: [
      { method: "GET", path: "/tv-series", fungsi: "Ambil semua data" },
      { method: "GET", path: "/tv-series/:id", fungsi: "Ambil satu data" },
      { method: "POST", path: "/tv-series", fungsi: "Tambah data baru" },
      { method: "PUT", path: "/tv-series/:id", fungsi: "Ubah seluruh data" },
      { method: "DELETE", path: "/tv-series/:id", fungsi: "Hapus data" },
      {
        method: "GET",
        path: "/tv-series?status=tayang",
        fungsi: "Filter berdasarkan status (tayang/tamat)",
      },
    ],
  });
});

// ======================================================
// GET /tv-series
// GET /tv-series?status=tamat  -> filter dengan query string (req.query)
// ======================================================
app.get("/tv-series", (req, res) => {
  const { status } = req.query;

  // jika ada query "status", filter data sesuai nilai status
  if (status) {
    const hasil = tvSeries.filter((item) => item.status === status);
    return res.status(200).json(hasil); // array, boleh kosong []
  }

  // tanpa filter -> kembalikan seluruh data
  res.status(200).json(tvSeries);
});

// ======================================================
// GET /tv-series/:id -> ambil satu data berdasarkan id
// ======================================================
app.get("/tv-series/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const data = tvSeries.find((item) => item.id === id);

  // jika tidak ditemukan -> 404
  if (!data) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  res.status(200).json(data); // objek langsung, tanpa status/message
});

// ======================================================
// POST /tv-series -> tambah data baru
// Body: { "judul": "Rahasia Kampus Tua", "jumlahEpisode": 12, "status": "tamat", "studio": "Layar Kita", "tahunRilis": 2025 }
// ======================================================
app.post("/tv-series", (req, res) => {
  const { judul, jumlahEpisode, status, studio, tahunRilis } = req.body;

  // validasi: field wajib (judul, jumlahEpisode, status, tahunRilis) tidak boleh kosong
  if (!judul || !jumlahEpisode || !status || !tahunRilis) {
    return res.status(400).json({
      status: "error",
      message: "judul, jumlahEpisode, status, dan tahunRilis wajib diisi",
      data: null,
    });
  }

  // validasi nilai enum status
  if (status !== "tayang" && status !== "tamat") {
    return res.status(400).json({
      status: "error",
      message: 'Field status hanya boleh bernilai "tayang" atau "tamat"',
      data: null,
    });
  }

  // id dibuat otomatis oleh server, bukan dari body
  const baru = {
    id: nextId++,
    judul,
    jumlahEpisode,
    status,
    studio: studio || "",
    tahunRilis,
  };

  tvSeries.push(baru);

  // berhasil -> 201 + data yang baru dibuat
  res.status(201).json({
    status: "success",
    message: "Data serial TV berhasil ditambahkan",
    data: baru,
  });
});

// ======================================================
// PUT /tv-series/:id -> ubah seluruh data (full replace)
// Body: { "judul": "...", "jumlahEpisode": 12, "status": "tayang", "studio": "...", "tahunRilis": 2026 }
// ======================================================
app.put("/tv-series/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tvSeries.findIndex((item) => item.id === id);

  // data tidak ditemukan -> 404
  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  const { judul, jumlahEpisode, status, studio, tahunRilis } = req.body;

  // validasi field wajib
  if (!judul || !jumlahEpisode || !status || !tahunRilis) {
    return res.status(400).json({
      status: "error",
      message: "judul, jumlahEpisode, status, dan tahunRilis wajib diisi",
      data: null,
    });
  }

  // validasi nilai enum status
  if (status !== "tayang" && status !== "tamat") {
    return res.status(400).json({
      status: "error",
      message: 'Field status hanya boleh bernilai "tayang" atau "tamat"',
      data: null,
    });
  }

  // penggantian penuh, id tetap sama
  tvSeries[index] = {
    id,
    judul,
    jumlahEpisode,
    status,
    studio: studio || "",
    tahunRilis,
  };

  res.status(200).json({
    status: "success",
    message: `Data serial TV dengan id ${id} berhasil diubah`,
    data: tvSeries[index],
  });
});

// ======================================================
// DELETE /tv-series/:id -> hapus data
// ======================================================
app.delete("/tv-series/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tvSeries.findIndex((item) => item.id === id);

  // data tidak ditemukan -> 404
  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${id} tidak ditemukan`,
      data: null,
    });
  }

  tvSeries.splice(index, 1);

  res.status(200).json({
    status: "success",
    message: `Data serial TV dengan id ${id} berhasil dihapus`,
    data: null,
  });
});

// ======================================================
// middleware catch-all -> route yang tidak terdaftar (404)
// harus diletakkan PALING BAWAH, setelah semua route
// ======================================================
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint tidak ditemukan",
    data: null,
  });
});

// jalankan server hanya saat bukan di lingkungan production (Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

// diekspor agar bisa dipakai sebagai serverless function oleh Vercel
module.exports = app;