const fs = require('fs');
const f = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';

console.log('\x1b[36m%s\x1b[0m', 'patch run...',); 

fs.readFile(f, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/node: false/g, `node: {
    crypto: true,
    stream: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
},
externals: {
    child_process: 'child_process',
    bindings: 'bindings'
}`);

  fs.writeFile(f, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});