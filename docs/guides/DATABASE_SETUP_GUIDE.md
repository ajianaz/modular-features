# Database Setup Guide

## ❌ Error: Database does not exist

Jika kamu mendapatkan error ini saat menjalankan `bun run db:migrate`:

```
cause: error: database "modular_monolith_test" does not exist
```

Artinya database PostgreSQL belum dibuat. Ikuti langkah-langkah di bawah ini untuk memperbaikinya.

---

## ✅ Solusi: Setup Database

### Opsi 1: Otomatis (Disarankan)

Jalankan perintah ini untuk setup database secara otomatis:

```bash
# Setup database (membuat database + menjalankan migrations)
bun run db:setup
```

Ini akan:
1. ✅ Membuat database `modular_monolith` 
2. ✅ Men-generate migration files
3. ✅ Menjalankan migrations

---

### Opsi 2: Manual (Jika Opsi 1 gagal)

#### Step 1: Buat database dengan SQL

Jika kamu memiliki akses ke psql, jalankan:

```bash
psql -U postgres -h localhost -p 5432 -d postgres -f scripts/setup-database.sql
```

Atau jalankan perintah SQL ini secara manual:

```sql
-- Buat database
CREATE DATABASE modular_monolith;

-- Hubungkan ke database baru
\c modular_monolith;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

#### Step 2: Generate migrations

```bash
bun run db:generate
```

#### Step 3: Jalankan migrations

```bash
bun run db:migrate
```

---

### Opsi 3: Reset Database (Jika ada error migration)

Jika kamu ingin reset dari awal (hapus semua data):

```bash
# Stop Docker containers (jika menggunakan Docker)
bun run db:down

# Start ulang database
bun run db:start

# Setup ulang
bun run db:setup
```

Atau gunakan perintah reset:

```bash
bun run db:reset
```

---

## 🔍 Troubleshooting

### Error: Connection refused

Pastikan PostgreSQL sudah berjalan:

```bash
# Jika menggunakan Docker
docker ps | grep postgres

# Jika menggunakan PostgreSQL lokal
psql -U postgres -h localhost -p 5432 -c "SELECT version();"
```

### Error: Password authentication failed

Cek password di file `.env`:

```bash
POSTGRES_PASSWORD=postgres123
```

Pastikan password sesuai dengan konfigurasi PostgreSQL kamu.

### Error: Connection timeout

Pastikan PostgreSQL berjalan di port yang benar:

```bash
POSTGRES_PORT=5432
```

---

## 📝 Environment Variables yang Diperlukan

Pastikan file `.env` kamu memiliki konfigurasi ini:

```bash
# Database Configuration
POSTGRES_DB=modular_monolith
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_PORT=5432
POSTGRES_HOST=localhost
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
```

---

## ✅ Verifikasi Setup

Setelah setup berhasil, kamu bisa verifikasi dengan:

```bash
# Cek apakah migrations sudah berjalan
bun run db:studio

# Atau query langsung ke database
psql -U postgres -h localhost -d modular_monolith -c "\dt"
```

Kamu seharusnya melihat semua tabel yang sudah dibuat oleh migrations.

---

## 📚 Next Steps

Setelah database setup selesai, lanjutkan dengan:

1. Install dependencies untuk notifications:
   ```bash
   bun add tencentcloud-sdk-nodejs firebase-admin handlebars
   ```

2. Setup environment variables untuk notifications (Tencent SES & FCM)

3. Jalankan aplikasi:
   ```bash
   bun run dev
   ```

---

## 🆘 Masih Ada Error?

Jika masih ada error setelah mencoba langkah-langkah di atas, hubungi tim dev atau cek:

1. Log PostgreSQL: `docker logs <postgres-container>`
2. Drizzle logs: Check output dari `bun run db:generate` dan `bun run db:migrate`
3. Environment variables: Pastikan semua variabel di `.env` sudah benar
