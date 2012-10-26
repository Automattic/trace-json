
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

  // cycle
  var cycle = (traces[trace.cycle] = traces[trace.cycle] || {});

  // start
  if (trace.start) {
    debug('start %j', trace);
    cycle[id] = trace;
    return;
  }

  // end
  debug('end %j', trace);
  if (!cycle[id]) return debug('missing trace %d', id);
  cycle[id].end = trace.end;
});