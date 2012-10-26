
/**
 * Module dependencies.
 */

var Tracer = require('..');

var trace = new Tracer('123', 'req/res');

trace.start('request', Date.now());
trace.end('request', Date.now() + 500);
