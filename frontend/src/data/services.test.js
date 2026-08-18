import test from 'node:test';
import assert from 'node:assert/strict';

import { addService, deleteService, updateService } from './services.js';

const initial = [
  { id: 'inspection', title: 'Inspection', price: 150, duration: '45 mins', desc: 'Basic inspection' },
  { id: 'cleaning', title: 'Cleaning', price: 200, duration: '60 mins', desc: 'Chimney cleaning' }
];

test('addService appends a new service with a generated id', () => {
  const updated = addService(initial, {
    title: 'Repair',
    price: 350,
    duration: '90 mins',
    desc: 'Structural repair'
  });

  assert.equal(updated.length, 3);
  assert.equal(updated[2].title, 'Repair');
  assert.equal(updated[2].price, 350);
  assert.ok(updated[2].id);
});

test('updateService replaces selected service fields', () => {
  const updated = updateService(initial, 'inspection', {
    title: 'Annual Inspection',
    price: 175,
    duration: '50 mins',
    desc: 'Updated description'
  });

  assert.equal(updated[0].title, 'Annual Inspection');
  assert.equal(updated[0].price, 175);
  assert.equal(updated[0].duration, '50 mins');
});

test('deleteService removes the selected service', () => {
  const updated = deleteService(initial, 'cleaning');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, 'inspection');
});
