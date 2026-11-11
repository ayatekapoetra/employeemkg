import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activePlacementArrivedAt,
  datetimeLowerBound,
  laterOf,
} from '../datetimeBounds.js';

// Regression: mobile dispatch tidak punya batas bawah waktu, sehingga
// departed_at bisa lebih awal dari arrived_at placement aktif dan menghasilkan
// baris ops_equipment_placements dengan arrived_at > departed_at.

test('activePlacementArrivedAt picks the earliest active placement arrival', () => {
  const item = {
    placements: [
      { id: 2, status: 'ACTIVE', departed_at: null, arrived_at: '2026-09-09 07:05:00' },
      { id: 1, status: 'ACTIVE', departed_at: null, arrived_at: '2026-08-01 00:00:00' },
    ],
  };
  const result = activePlacementArrivedAt(item);
  assert.ok(result instanceof Date);
  assert.equal(result.toISOString(), new Date('2026-08-01T00:00:00+08:00').toISOString());
});

test('activePlacementArrivedAt returns null when there is no active placement', () => {
  assert.equal(activePlacementArrivedAt({}), null);
  assert.equal(activePlacementArrivedAt({ placements: [] }), null);
  assert.equal(activePlacementArrivedAt({ placements: [{ id: 1 }] }), null);
  assert.equal(activePlacementArrivedAt({ placements: [{ arrived_at: 'bukan-tanggal' }] }), null);
});

test('datetimeLowerBound uses placement arrival for dispatch and item departure for arrive', () => {
  const item = {
    departed_at: '2026-09-10 08:00:00',
    placements: [{ id: 5, arrived_at: '2026-09-09 07:05:00' }],
  };

  const dispatchBound = datetimeLowerBound('dispatch', item);
  assert.equal(dispatchBound.toISOString(), new Date('2026-09-09T07:05:00+08:00').toISOString());

  const arriveBound = datetimeLowerBound('arrive', item);
  assert.equal(arriveBound.toISOString(), new Date('2026-09-10T08:00:00+08:00').toISOString());

  assert.equal(datetimeLowerBound('arrive', {}), null);
  assert.equal(datetimeLowerBound('dispatch', {}), null);
});

test('laterOf never lowers a picked value below the bound', () => {
  const bound = new Date('2026-09-09T07:05:00+08:00');
  const earlier = new Date('2026-09-07T22:26:00+08:00');
  const later = new Date('2026-09-10T08:00:00+08:00');

  assert.equal(laterOf(earlier, bound).toISOString(), bound.toISOString());
  assert.equal(laterOf(later, bound).toISOString(), later.toISOString());
  assert.equal(laterOf(earlier, null).toISOString(), earlier.toISOString());
  assert.equal(laterOf(null, bound).toISOString(), bound.toISOString());
  assert.equal(laterOf(null, null), null);
});
