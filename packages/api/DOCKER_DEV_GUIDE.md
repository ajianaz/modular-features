# Docker Development Guide

## Development Mode dengan Hot Reload

Mode development menggunakan `docker-compose.override.yml` yang otomatis di-load ketika menjalankan `docker-compose up` di lokal.

### Fitur Development Mode:
- ✅ **Hot Reload** - Perubahan code otomatis ter-reload via `bun --watch`
- ✅ **Volume Mounts** - Source code di-mount langsung ke container
- ✅ **Debug Logging** - Log level debug untuk troubleshooting
- ✅ **Fast Iteration** - Tidak perlu rebuild image setiap kali ubah code

## Cara Menjalankan

### 1. Development Mode (Default)
```bash
# Jalankan semua services dengan hot reload
docker-compose up

# Atau di background
docker-compose up -d

# Lihat logs API
docker-compose logs -f api
```

Ketika ada perubahan file di `packages/api/src/`, container akan otomatis reload.

### 2. Production Mode
```bash
# Build dan jalankan production image
docker-compose -f docker-compose.yml up --build

# Atau dengan detach mode
docker-compose -f docker-compose.yml up -d --build
```

### 3. Menjalankan Service Tertentu
```bash
# Hanya PostgreSQL dan Redis
docker-compose up postgres redis

# Hanya API (pastikan postgres & redis sudah jalan)
docker-compose up api

# Development mode: semua services
docker-compose up
```

## Perintah Docker Compose Umum

```bash
# Cek status semua services
docker-compose ps

# Restart semua services
docker-compose restart

# Restart API saja
docker-compose restart api

# Stop semua services
docker-compose down

# Stop dan hapus volumes (hapus semua data)
docker-compose down -v

# Lihat logs real-time
docker-compose logs -f

# Lihat logs API saja
docker-compose logs -f api

# Masuk ke container API (untuk debugging)
docker-compose exec api sh
```

## Troubleshooting

### Container API tidak mau start
```bash
# Cek logs
docker-compose logs api

# Rebuild image (jika ada perubahan dependency)
docker-compose build --no-cache api
docker-compose up -d
```

### Hot reload tidak bekerja
Pastikan:
1. Menggunakan development mode (`docker-compose up`, bukan `-f docker-compose.yml`)
2. File yang diubah ada di folder yang di-mount (lihat `docker-compose.override.yml`)
3. `bun --watch` berjalan (cek logs: "Watching for file changes...")

### Database connection error
```bash
# Cek status PostgreSQL
docker-compose ps postgres

# Cek logs PostgreSQL
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port sudah digunakan
Edit `.env` untuk mengubah port:
```bash
PORT=3001  # Ganti port API
POSTGRES_PORT=5433  # Ganti port PostgreSQL
```

## Struktur Dockerfile

```
base          → Image dasar (oven/bun:1)
install       → Install semua dependencies
build         → Compile TypeScript
development   → Development mode dengan bun --watch
release       → Production image minimal
```

## Environment Variables

Development menggunakan environment variables dari `.env`. Untuk override variables di Docker Compose:

```bash
# Override via command line
docker-compose up -d
POSTGRES_PASSWORD=newpass docker-compose up
```

Atau edit langsung di `docker-compose.override.yml`.

## Akses Service

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| PostgreSQL | localhost:5432 | postgres:postgres123 |
| Redis | localhost:6379 | Password: redis123 |

## Tips Development

1. **Rebuild setelah dependency change**:
   ```bash
   docker-compose build --no-cache api
   ```

2. **Cek resource usage**:
   ```bash
   docker stats
   ```

3. **Hapus image lama**:
   ```bash
   docker image prune -a
   ```

4. **Fresh start**:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```
