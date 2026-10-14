import assert from 'node:assert/strict';
import test from 'node:test';
import { timezoneMenu, withTimezone, zoneByKey, zoneOf } from '../src/time.js';

test('india is the first choice on the menu', () => {
  const menu = timezoneMenu('42').toJSON().components[0];
  assert.equal(menu.custom_id, 'tz:42');
  assert.equal(menu.options[0].value, 'ist');
  assert.match(menu.options[0].label, /india/);
  assert.equal(zoneByKey('ist').name, 'ist');
});

test('a nickname shows the zone and can be switched', () => {
  assert.equal(withTimezone('Venera', 'ist'), 'Venera · ist');
  assert.equal(withTimezone('Venera · gst', 'ist'), 'Venera · ist');
  assert.equal(withTimezone('a'.repeat(30), 'ist'), null);
});

test('the role on a member is their timezone', () => {
  const member = {
    roles: {
      cache: [{ name: 'guest' }, { name: 'ist' }],
    },
  };
  assert.equal(zoneOf(member).name, 'ist');
  assert.equal(zoneOf({ roles: { cache: [{ name: 'guest' }] } }), null);
});
