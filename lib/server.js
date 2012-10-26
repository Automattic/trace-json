
/**
 * Module dependencies.
 */

var axon = require('axon')
  , debug = require('debug')('tracer');

/**
 * Socket.
 */

var sock = axon.socket('sub');
sock.format('json');

/**
 * Memory "db".
 */

var traces = {};

/**
 * Expose the socket.
 */

module.exports = sock;

/**
 * Handle messages.
 */

sock.on('message', function(trace){
  var id = trace.id;

  if (trace.start) {
    debug('start %j', trace);
    traces[id] = trace;
  } else {
    debug('end %j', trace);
    if (!traces[id]) return debug('missing trace %d', id);
    traces[id].end = trace.end;
  }
});