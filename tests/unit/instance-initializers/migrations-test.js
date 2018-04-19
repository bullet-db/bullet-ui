import { resolve } from 'rsvp';
import Application from '@ember/application';
import { run } from '@ember/runloop';
import StartupInitializer from 'bullet-ui/initializers/startup';
import { initialize, applyMigrations } from 'bullet-ui/instance-initializers/migrations';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';

module('Unit | Instance Initializer | migrations', {
  beforeEach() {
    run(() => {
      this.application = Application.create();
      StartupInitializer.initialize(this.application);
      this.appInstance = this.application.buildInstance();
    });
  },

  afterEach() {
    run(this.appInstance, 'destroy');
    destroyApp(this.application);
  }
});

test('it initializes', function(assert) {
  initialize(this.appInstance);
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
