# 🕸️ Spider Cam 3D — Simulasi Interaktif

Simulasi 3D interaktif sistem **Spider Cam** (kamera gantung berkabel) menggunakan **Three.js**. Proyek ini merepresentasikan mekanisme kamera yang digantung oleh 4 kabel dari tiang-tiang penyangga, dengan kontrol pergerakan real-time dan telemetri sensor.

> Dibuat untuk **Tugas Robotika** — Simulasi kontrol pergerakan payload pada sistem Cable-Driven Parallel Robot (CDPR).

---

## 🎯 Deskripsi

Spider Cam adalah sistem kamera yang dikendalikan oleh kabel-kabel yang terhubung ke tiang penyangga di empat sudut area. Dengan mengatur panjang masing-masing kabel, posisi kamera dapat digerakkan secara 3D (sumbu X, Y, dan Z).

Simulasi ini memvisualisasikan:
- **4 tiang penyangga** berwarna di setiap sudut area
- **4 kabel** yang menghubungkan tiang ke payload (kamera)
- **Spider Cam (payload)** yang dapat digerakkan secara real-time
- **Perhitungan panjang kabel** menggunakan jarak Euclidean 3D
- **Label panjang kabel** yang ditampilkan langsung pada tali di scene 3D

---

## ✨ Fitur

| Fitur | Deskripsi |
|---|---|
| 🎮 **Kontrol Real-Time** | Gerakkan spider cam dengan keyboard (WASDQE) |
| 📐 **Telemetri Sensor** | Posisi XYZ dan panjang 4 kabel ditampilkan real-time |
| 🏷️ **Label pada Tali** | Panjang kabel ditampilkan langsung di tengah setiap kabel 3D |
| 🗺️ **Mini-map** | Tampilan top-down di sudut kiri bawah |
| 🌟 **Bloom Post-Processing** | Efek glow pada elemen bercahaya |
| ✨ **Partikel Melayang** | 200 partikel ambient untuk efek visual |
| 🎨 **Tiang Berwarna** | Setiap tiang berwarna sesuai kabelnya (pink, kuning, hijau, biru) |
| 🔄 **OrbitControls** | Putar dan zoom tampilan kamera dengan mouse |
| 📊 **FPS Counter** | Monitor performa real-time |
| 📱 **Responsive** | Menyesuaikan ukuran layar secara otomatis |

---

## 🎮 Kontrol

### Navigasi Spider Cam

| Tombol | Aksi | Sumbu |
|--------|------|-------|
| `W` | Maju | Z- |
| `S` | Mundur | Z+ |
| `A` | Kiri | X- |
| `D` | Kanan | X+ |
| `Q` | Naik | Y+ |
| `E` | Turun | Y- |

### Kamera Tampilan

| Input | Aksi |
|-------|------|
| Klik + Drag | Memutar pandangan 3D |
| Scroll | Zoom in / out |

---

## 📁 Struktur File

```
tugas robotika/
├── spider_cam_3d.html    # Halaman utama (HTML + CSS + UI)
├── spider_cam_3d.js      # Logika simulasi 3D (JavaScript / Three.js)
└── README.md             # Dokumentasi proyek (file ini)
```

### `spider_cam_3d.html`
Berisi struktur HTML dan styling CSS untuk:
- Loading screen animasi
- Panel kontrol (kiri) — panduan keyboard
- Panel telemetri (kanan) — koordinat dan panjang kabel
- Status bar (bawah) — FPS, speed, live indicator
- Mini-map (kiri bawah) — tampilan top-down
- Referensi ke library Three.js (CDN) dan file `spider_cam_3d.js`

### `spider_cam_3d.js`
Berisi seluruh logika JavaScript:
- Setup scene Three.js (kamera, renderer, pencahayaan)
- Bloom post-processing dengan fallback
- Pembuatan objek 3D (tiang, spider cam, kabel, lantai grid, partikel)
- Sprite label untuk menampilkan panjang kabel pada tali
- Input keyboard dan update posisi
- Perhitungan panjang kabel (jarak Euclidean 3D)
- Mini-map 2D canvas
- Animation loop

---

## 🚀 Cara Menjalankan

### Metode 1: Server Lokal (Direkomendasikan)

```bash
# Masuk ke folder proyek
cd "tugas robotika"

# Jalankan server lokal menggunakan npx
npx -y http-server . -p 8080

# Buka di browser
# http://localhost:8080/spider_cam_3d.html
```

### Metode 2: Live Server (VS Code)

1. Install ekstensi **Live Server** di VS Code
2. Klik kanan pada `spider_cam_3d.html`
3. Pilih **"Open with Live Server"**

### Metode 3: Buka Langsung

Buka file `spider_cam_3d.html` langsung di browser (double-click). 

> ⚠️ **Catatan**: Metode ini mungkin tidak bekerja di beberapa browser karena kebijakan CORS untuk file lokal. Gunakan server lokal jika mengalami masalah.

---

## 🧮 Perhitungan Panjang Kabel

Panjang setiap kabel dihitung menggunakan **jarak Euclidean 3D** antara posisi tiang (anchor) dan posisi spider cam:

```
L = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²]
```

Di mana:
- `(x₁, y₁, z₁)` = posisi ujung tiang (tetap)
- `(x₂, y₂, z₂)` = posisi spider cam (bergerak)

### Posisi Tiang Penyangga

| Tiang | Posisi (X, Y, Z) | Warna |
|-------|-------------------|-------|
| 1 | (-100, 100, -100) | 🩷 Pink |
| 2 | (100, 100, -100) | 🟡 Kuning |
| 3 | (100, 100, 100) | 🟢 Hijau |
| 4 | (-100, 100, 100) | 🔵 Biru |

### Parameter Simulasi

| Parameter | Nilai |
|-----------|-------|
| Tinggi tiang | 100 unit |
| Jarak offset tiang | ±100 unit |
| Kecepatan gerak | 1.5 unit/frame |
| Posisi awal cam | (0, 50, 0) |
| Batas gerak X/Z | -100 s/d 100 |
| Batas gerak Y | 0 s/d 100 |

---

## 🛠️ Teknologi

- **[Three.js](https://threejs.org/)** r128 — Library 3D WebGL
- **OrbitControls** — Kontrol rotasi kamera
- **UnrealBloomPass** — Efek bloom post-processing
- **Canvas 2D** — Mini-map dan label tali
- **Google Fonts** — Inter & JetBrains Mono
- **HTML5 / CSS3 / JavaScript ES6**

---

## 📸 Tampilan

Simulasi menampilkan:

```
┌──────────────────────────────────────────────────┐
│ [Panel Kontrol]              [Panel Telemetri]   │
│  Spider Cam 3D                Posisi: X Y Z      │
│  WASD/QE keys                 Kabel 1: xxx cm    │
│                                Kabel 2: xxx cm    │
│              ● ─────── ●      Kabel 3: xxx cm    │
│              │ \     / │      Kabel 4: xxx cm    │
│              │  [CAM]  │                          │
│              │ /     \ │                          │
│              ● ─────── ●                          │
│                                                    │
│ [Mini-map]           [LIVE  FPS  Speed]           │
└──────────────────────────────────────────────────┘
```

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan tugas akademik.

---

<p align="center">
  <b>Spider Cam 3D</b> — Simulasi Kontrol Real-Time<br>
  Tugas Robotika
</p>
