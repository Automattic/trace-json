
/**
 * Module dependencies.
 */

var Tracer = require('..');

var trace = new Tracer('req/res', '123');

var n = 500;

// simulate N fake http
// requests to upload an image,
// resize, and transfer to s3.

next();

function next() {
  --n || process.exit();

  // faux http upload
  var now = Date.now();
  trace.start('request', now);

  // image resizing
  trace.start('resize', now += Math.random() * 100);

  // update db in parallel
  trace.start('save', now);
  trace.end('save', now + 50);

  // transfer to s3
  trace.start('s3', now);
  trace.end('s3', now += Math.random() * 100);

  // resize complete
  trace.end('resize', now += Math.random() * 50);

  // response flushed
  trace.end('request', now + 50);

  process.nextTick(next);
}