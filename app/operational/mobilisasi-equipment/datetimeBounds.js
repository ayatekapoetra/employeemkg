import moment from 'moment'

/**
 * Batas waktu untuk aksi mobilisasi equipment.
 *
 * Regresi yang dicegah: `POST /operation/equipment-mobilization/:id/items/:itemId/dispatch`
 * dulu tidak punya batas bawah, sehingga `departed_at` bisa lebih awal dari
 * `arrived_at` placement aktif. Hasilnya baris `ops_equipment_placements`
 * dengan arrived_at > departed_at, yang lalu diteruskan trigger productivity
 * ke `ops_productivity_dirty_ranges` sebagai rentang terbalik.
 *
 * Modul ini sengaja tidak mengimpor theme/konstanta agar bisa diuji murni.
 */

/**
 * Waktu tiba paling awal dari placement aktif milik sebuah item.
 * @returns {Date|null}
 */
export const activePlacementArrivedAt = (item = {}) => {
  const placements = Array.isArray(item.placements) ? item.placements : []
  const valid = placements
    .filter((placement) => placement && placement.arrived_at)
    .map((placement) => moment(placement.arrived_at))
    .filter((parsed) => parsed.isValid())
    .sort((a, b) => a.valueOf() - b.valueOf())
  return valid.length ? valid[0].toDate() : null
}

/**
 * Batas bawah input waktu aksi.
 * - dispatch: waktu tiba placement aktif (tidak boleh menutup placement
 *   dengan waktu berangkat yang lebih awal dari waktu tibanya)
 * - arrive  : waktu berangkat item
 * @returns {Date|null}
 */
export const datetimeLowerBound = (type, item = {}) => {
  if (type === 'arrive') {
    const departed = item.departed_at ? moment(item.departed_at) : null
    return departed && departed.isValid() ? departed.toDate() : null
  }
  return activePlacementArrivedAt(item)
}

/** Pilih nilai yang paling akhir; null dianggap tidak ada batas. */
export const laterOf = (a, b) => {
  if (!a) return b || null
  if (!b) return a || null
  return a.getTime() >= b.getTime() ? a : b
}
