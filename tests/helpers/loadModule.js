const fs = require('fs');
const vm = require('vm');

module.exports = function loadModule(filename, mocks = {}) {
  const code = fs.readFileSync(filename, 'utf8');
  const sandbox = {
    module: { exports: {} },
    exports: {},
    require: (id) => (id in mocks ? mocks[id] : require(id))
  };
  vm.runInNewContext(code, sandbox, { filename });
  return sandbox.module.exports;
};
