# TODO: Work Order Feature (Operational)

- [x] Buat struktur folder `app/operational/work-order/` dan routing akses dari tombol dashboard operational
- [x] Siapkan service/store slice (fetch list WO + actions, redux slice `workOrderSlice`)
- [x] Implementasi layar list WO dengan search, status chips, refresh
- [x] Implementasi layar detail WO:
  - [x] Render info issue (kode WO, equipment, status, timestamps `services_at`, `ready_at`)
  - [x] Tampilkan riwayat aksi teknisi (list `ops_daily_breakdown_action`)
  - [x] Form/CTA untuk update status + waktu handle/selesai (WT/WS/WP/WV/IP/WTT/DONE)
- [ ] Desain UI lebih kaya (timeline aksi, badge status berwarna, skeleton/loading states, error banner)
- [ ] Integrasi filter lanjutan (equipment/lokasi/cabang) + indikator filter sinkron
- [ ] Uji alur (navigasi, fetch, update) dan perbaiki state/error handling
