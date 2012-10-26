
/**
 * Module dependencies.
 */

var Trace = require('..');

var id = 0;
var n = 500;

// simulate N fake http
// requests to upload an image,
// resize, and transfer to s3.

next();

function next() {
  if (!--n) return done();
  var trace = new Trace('req/res', id++);

  // faux http upload
  var now = Date.now();
  trace.start('request', now);

  // image resizing
  trace.start('resize', now += Math.random() * 100 | 0);

  // update db in parallel
  trace.start('save', now);
  trace.end('save', now + 50);

  // transfer to s3
  trace.start('s3', now);
  trace.end('s3', now += Math.random() * 100 | 0);

  // resize complete
  trace.end('resize', now += Math.random() * 50 | 0);

  // response flushed
  trace.end('request', now + 50);

  process.nextTick(next);
}

function done() {
  var start = new Date;
  Trace.get('req/res', function(err, traces){
    console.log(new Date - start);
    console.log(JSON.stringify(traces, null, 2));
    process.exit(0);
  });
}