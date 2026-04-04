# PRD - Fitur Monitoring Kinerja Crew Mining

## 1. Overview

Fitur ini bertujuan untuk memonitor dan mencatat kinerja crew mining (bukan operator/driver) dimana crew melakukan input mandiri jam kerja, aktivitas, dan supervisor melakukan validasi serta approval.

## 2. User Stories

- **Sebagai Crew Mining**, **saya ingin** input jam kerja dan aktivitas harian saya sendiri **agar** produktivitas saya tercatat dengan akurat
- **Sebagai Supervisor**, **saya ingin** melihat dan men-validasi input jam kerja crew **agar** data yang masuk valid dan dapat dipertanggungjawabkan
- **Sebagai HR/Admin**, **saya ingin** melihat rekap jam lembur crew yang sudah di-approve **agar** dapat menghitung penggajian yang akurat
- **Sebagai Supervisor**, **saya ingin** mengetahui jam kerja crew di bawah supervisi saya **agar** dapat mengatur jadwal dengan efisien

## 3. Functional Requirements

### 3.1 Input Mandiri oleh Crew

- **Tanggal Operasional**: Pilih tanggal aktivitas kerja (bisa hari ini atau hari sebelumnya)
- **Waktu Mulai Kerja**: Input jam mulai kerja crew
- **Waktu Selesai Kerja**: Input jam selesai kerja crew
- **Jam Istirahat**: 
  - Jam mulai istirahat
  - Jam selesai istirahat
- **Supervisor**: Select/assign supervisor untuk shift tersebut
- **Keterangan**: Narasi aktivitas kerja yang dilakukan oleh crew (wajib diisi)
- **Status**: 
  - 'P' = Pending (default saat create)
  - 'A' = Approved (setelah supervisor approve)
  - 'R' = Rejected (setelah supervisor reject)

### 3.2 Validasi & Approval oleh Supervisor

- **Dashboard Approval**: List semua input crew yang menunggu approval
- **Detail Review**: Melihat detail input jam kerja crew
- **Validation Check**: 
  - Cek overlap jadwal
  - Validasi jam istirahat yang reasonable
  - Validasi narasi aktivitas yang sesuai
- **Approval Action**: Approve/Reject dengan komentar tambahan jika perlu
- **Notification**: Notifikasi ke crew jika sudah di-approve/rejected

### 3.3 Perhitungan Otomatis

- **Total Jam Kerja**: Hitung otomatis (jam selesai - jam mulai)
- **Total Jam Istirahat**: Hitung otomatis (selesai istirahat - mulai istirahat)
- **Jam Kerja Produktif**: Total jam kerja dikurangi jam istirahat
- **Jam Lembur**: Otomatis terhitung jika jam kerja produktif > 8 jam (hanya untuk yang status='A')

### 3.4 Reporting & Monitoring

- **Laporan Harian**: Rekap jam kerja per crew per hari
- **Laporan Mingguan**: Summary jam kerja dan lembur per minggu
- **Laporan Bulanan**: Rekap untuk keperluan penggajian
- **Filter & Sorting**: Berdasarkan tanggal, crew, status approval, supervisor

## 4. Database Design

### Table: ops_crew_workhours (Single Table Only)
```sql
-- Drop table jika sudah ada
DROP TABLE IF EXISTS `ops_crew_workhours`;

-- Create table dengan utf8mb4_general_ci charset
CREATE TABLE `ops_crew_workhours` (
    `id` INT(10) unsigned NOT NULL AUTO_INCREMENT,
    `tanggal` DATE NOT NULL COMMENT 'Tanggal operasional',
    `jam_mulai` TIME NOT NULL COMMENT 'Jam mulai kerja',
    `jam_selesai` TIME NOT NULL COMMENT 'Jam selesai kerja',
    `istirahat_mulai` TIME NOT NULL COMMENT 'Jam mulai istirahat',
    `istirahat_selesai` TIME NOT NULL COMMENT 'Jam selesai istirahat',
    `keterangan` TEXT NOT NULL COMMENT 'Narasi aktivitas kerja',
    `total_jam_kerja` DECIMAL(4,2) DEFAULT NULL COMMENT 'Total jam kerja - dihitung otomatis',
    `total_jam_istirahat` DECIMAL(4,2) DEFAULT NULL COMMENT 'Total jam istirahat - dihitung otomatis',
    `jam_kerja_produktif` DECIMAL(4,2) DEFAULT NULL COMMENT 'Jam kerja produktif - dihitung otomatis',
    `jam_kerja_normal` DECIMAL(4,2) DEFAULT 8.00 COMMENT 'Jam kerja normal (default 8 jam)',
    `jam_lembur` DECIMAL(4,2) DEFAULT NULL COMMENT 'Jam lembur - dihitung otomatis',
    `crew_id` INT(10) unsigned NOT NULL COMMENT 'Foreign key ke mas_karyawans (crew)',
    `spv_id` INT(10) unsigned DEFAULT NULL COMMENT 'Foreign key ke mas_karyawans (supervisor)',
    `cabang_id` INT(10) unsigned DEFAULT NULL COMMENT 'Foreign key ke mas_cabangs',
    `area` VARCHAR(100) DEFAULT NULL COMMENT 'Area dari mas_cabangs.area',
    `status` ENUM('P', 'A', 'R') NOT NULL DEFAULT 'P' COMMENT 'P=pending, A=approved, R=rejected',
    `aktif` ENUM('Y', 'N') NOT NULL DEFAULT 'Y' COMMENT 'Soft delete data row',
    `approval_at` DATETIME NULL COMMENT 'Waktu approval/rejection',
    `komentar_spv` TEXT NULL COMMENT 'Komentar supervisor',
    `createdby` INT(10) unsigned DEFAULT NULL COMMENT 'Foreign key ke users',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Table untuk pencatat jam kerja crew mining';
```

## 5. API Endpoints

### Crew Endpoints
- `POST /api/crew-work-hours` - Create work hour (status default: 'P')
- `PUT /api/crew-work-hours/{id}` - Update work hour (hanya jika status = 'P')
- `DELETE /api/crew-work-hours/{id}` - Delete work hour (hanya jika status = 'P')
- `GET /api/crew-work-hours/my-records` - Get crew's own work hours
- `GET /api/crew-work-hours/{id}` - Get work hour detail

### Supervisor Endpoints
- `GET /api/crew-work-hours/pending` - Get pending approvals
- `PUT /api/crew-work-hours/{id}/approve` - Approve work hour
- `PUT /api/crew-work-hours/{id}/reject` - Reject work hour
- `PUT /api/crew-work-hours/{id}/cancel-approval` - Cancel approval
- `GET /api/crew-work-hours/approved` - Get approved records

### Report Endpoints
- `GET /api/reports/crew-work-hours` - Get work hours report
- `GET /api/reports/crew-lembur` - Get lembur report (approved only)
- `GET /api/reports/summary` - Get summary report

## 6. Business Rules

- Jam kerja normal = 8 jam
- Jam lembur = jam kerja produktif - 8 jam (jika > 8 jam)
- Minimal istirahat = 1 jam (bisa diatur)
- Crew hanya bisa input untuk dirinya sendiri
- Hanya jam kerja yang sudah di-approve yang dihitung sebagai lembur
- Crew bisa mengedit input yang masih status 'P'
- Input yang sudah 'A' tidak bisa diedit (hanya supervisor yang bisa membatalkan approval)
- Status default saat create: 'P'
- Field `spv_id` terisi saat supervisor melakukan approve/reject
- Field `approval_at` terisi otomatis saat status berubah dari 'P' ke 'A' atau 'R'

## 7. User Flow

### Crew Flow:
1. Login → Menu Input Jam Kerja → Isi Form → Submit (Status: P)
2. Notifikasi jika sudah di-approve/reject
3. Melihat riwayat input jam kerja
4. Edit input yang masih status 'P'

### Supervisor Flow:
1. Login → Dashboard Approval → Review Input → Approve/Reject
2. Lihat rekap jam kerja crew
3. Membatalkan approval jika diperlukan

## 8. Non-Functional Requirements

- **Responsive Design**: Dapat diakses di mobile dan desktop
- **Performance**: Loading time < 3 detik untuk 1000 records
- **Security**: Role-based access control
- **Data Validation**: Input validation di frontend dan backend
- **Audit Trail**: Log semua perubahan status approval

## 9. UI/UX Requirements

- **Form Input**: Clean dan intuitive dengan datetime picker
- **Dashboard**: Visualisasi data jam kerja dan lembur
- **Mobile First**: Prioritas untuk penggunaan di mobile
- **Dark/Light Mode**: Mendukung tema aplikasi
- **Status Indicator**: Warna dan icon untuk status approval

## 10. Success Metrics

- **Adoption Rate**: 90% crew menggunakan fitur ini
- **Data Accuracy**: 95% data yang di-approve tanpa perbaikan
- **Processing Time**: Approval dalam 24 jam
- **User Satisfaction**: Score > 4/5 dari survey user

## Appendix: MySQL Scripts

### Create Database dengan utf8mb4_general_ci
```sql
-- Create database dengan utf8mb4_general_ci
CREATE DATABASE IF NOT EXISTS `crew_work_hours_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

USE `crew_work_hours_db`;
```

### Sample Data Insert
```sql
-- Sample data untuk testing
INSERT INTO `ops_crew_workhours` (
    `tanggal`, `jam_mulai`, `jam_selesai`, `istirahat_mulai`, `istirahat_selesai`, 
    `keterangan`, `crew_id`, `spv_id`, `cabang_id`, `area`, `status`, `aktif`, `createdby`,
    `total_jam_kerja`, `total_jam_istirahat`, `jam_kerja_produktif`, `jam_kerja_normal`, `jam_lembur`
) VALUES 
-- 01 Maret 2026 - Senin
('2026-03-01', '07:00:00', '17:00:00', '12:00:00', '13:00:00', 'Maintenance alat berat dan pengecekan rutin excavator unit 01', 999, 2, 1, 'JAKARTA', 'P', 'Y', 1, 10.00, 1.00, 9.00, 8.00, 1.00),

-- 02 Maret 2026 - Selasa
('2026-03-02', '07:00:00', '17:00:00', '12:00:00', '13:00:00', 'Perbaikan hydraulic system dan penggantian oli dumptruck unit 05', 999, 2, 1, 'JAKARTA', 'A', 'Y', 1, 10.00, 1.00, 9.00, 8.00, 1.00),

-- 03 Maret 2026 - Rabu
('2026-03-03', '07:00:00', '17:00:00', '12:00:00', '13:00:00', 'Pengecekan harian dan cleaning dozer unit 03', 999, 2, 1, 'JAKARTA', 'P', 'Y', 1, 10.00, 1.00, 9.00, 8.00, 1.00),

-- 04 Maret 2026 - Kamis
('2026-03-04', '07:00:00', '17:00:00', '12:00:00', '13:00:00', 'Pekerjaan penggalian tanah untuk proyek', 999, 2, 1, 'JAKARTA', 'R', 'Y', 1, 10.00, 1.00, 9.00, 8.00, 1.00),

-- 05 Maret 2026 - Jumat
('2026-03-05', '07:00:00', '17:00:00', '12:00:00', '13:00:00', 'Aktivitas normal hari Jumat', 999, 2, 1, 'JAKARTA', 'P', 'Y', 1, 10.00, 1.00, 9.00, 8.00, 1.00);

-- Update approval_at untuk status A dan R
UPDATE `ops_crew_workhours` 
SET `approval_at` = CASE 
  WHEN `status` = 'A' THEN '2026-03-02 10:30:00'
  WHEN `status` = 'R' THEN '2026-03-04 14:15:00'
  ELSE NULL
END
WHERE `status` IN ('A', 'R');

-- Update komentar_spv untuk status A dan R
UPDATE `ops_crew_workhours` 
SET `komentar_spv` = CASE 
  WHEN `status` = 'A' AND `tanggal` = '2026-03-02' THEN 'Approve: Pekerjaan sesuai standar operasional'
  WHEN `status` = 'R' AND `tanggal` = '2026-03-04' THEN 'Reject: Dokumentasi tidak lengkap, harap dilengkapi'
  ELSE NULL
END
WHERE `status` IN ('A', 'R');
```

### Common Queries
```sql
-- Get all pending approvals
SELECT 
    cwh.id, 
    cwh.tanggal, 
    cwh.jam_mulai, 
    cwh.jam_selesai, 
    cwh.status,
    crew.nama as crew_name,
    crew.nama as supervisor_nama -- Mengambil nama supervisor
FROM ops_crew_workhours cwh
JOIN mas_karyawans crew ON cwh.crew_id = crew.id
WHERE cwh.status = 'P'
ORDER BY cwh.tanggal DESC, cwh.created_at DESC;

-- Get lembur report per bulan (hanya yang approved)
SELECT 
    crew.id as crew_id,
    crew.nama as crew_name,
    COUNT(cwh.id) as total_hari_kerja,
    SUM(cwh.jam_kerja_produkf) as total_jam_kerja,
    SUM(cwh.jam_lembur) as total_jam_lembur,
    DATE_FORMAT(cwh.tanggal, '%Y-%m') as bulan
FROM ops_crew_workhours cwh
JOIN mas_karyawans crew ON cwh.crew_id = crew.id
WHERE cwh.status = 'A'
    AND cwh.tanggal BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY crew.id, crew.nama, DATE_FORMAT(cwh.tanggal, '%Y-%m')
ORDER BY crew.nama, bulan;

-- Get summary statistics
SELECT 
    COUNT(CASE WHEN status = 'P' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'A' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'R' THEN 1 END) as rejected_count,
    COUNT(*) as total_count,
    AVG(CASE WHEN status = 'A' THEN jam_kerja_produkf END) as avg_productive_hours,
    SUM(CASE WHEN status = 'A' THEN jam_lembur END) as total_overtime
FROM ops_crew_workhours
WHERE tanggal BETWEEN '2026-03-01' AND '2026-03-31';
```

### Trigger for Validation (Optional)
```sql
-- Trigger untuk mencegah overlap jadwal
DELIMITER //
CREATE TRIGGER prevent_overlap_schedule
BEFORE INSERT ON ops_crew_workhours
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    
    SELECT COUNT(*) INTO overlap_count
    FROM ops_crew_workhours
    WHERE crew_id = NEW.crew_id
        AND tanggal = NEW.tanggal
        AND status IN ('P', 'A')
        AND (
            (NEW.jam_mulai BETWEEN jam_mulai AND jam_selesai) OR
            (NEW.jam_selesai BETWEEN jam_mulai AND jam_selesai) OR
            (jam_mulai BETWEEN NEW.jam_mulai AND NEW.jam_selesai)
        );
    
    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Overlap jadwal kerja tidak diperbolehkan';
    END IF;
END//
DELIMITER ;
```