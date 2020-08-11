import { resolve } from 'rsvp';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import Application from 'bullet-ui/app';
import { applyMigrations } from 'bullet-ui/instance-initializers/migrations';

module('Unit | Instance Initializer | migrations', function(hooks) {
  hooks.beforeEach(function() {
    run(() => {
      this.application = Application.create({ autoboot: false });
      this.appInstance = this.application.buildInstance();
    });
  });

  hooks.afterEach(function() {
    run(this.appInstance, 'destroy');
    run(this.application, 'destroy');
  });

  test('it initializes', async function(assert) {
    await this.appInstance.boot();
    assert.ok(true);
  });

  test('it functions even if the manager cannot be looked up', function(assert) {
    assert.expect(1);
    applyMigrations(null, null);
    assert.ok(true);
  });

  test('it applies the delete results migration', function(assert) {
    assert.expect(1);

    let manager = {
      deleteAllResults() {
        assert.ok(true);
      }
    };
    let migrations = { deletions: 'result' };

    applyMigrations(manager, migrations);
  });

  test('it applies the delete queries migration', function(assert) {
    assert.expect(2);

    let migrations = { deletions: 'query' };
    let forage = {
      INDEXEDDB: window.localforage.INDEXEDDB,
      setDriver(driver) {
        assert.equal(driver, window.localforage.INDEXEDDB);
        return resolve();
      },
      clear() {
        assert.ok(true);
        return resolve();
      }
    };

    applyMigrations({ }, migrations, forage);
  });
});
