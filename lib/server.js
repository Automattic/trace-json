
/**
 * Module dependencies.
 */

var axon = require('axon')
  , debug = require('debug')('tracer');

/**
 * Socket.
 */

var sub = axon.socket('sub');
sub.format('json');

/**
 * Reply socket.
 */

var rep = axon.socket('rep');
rep.format('json');

/**
 * Memory "db".
 */

var traces = {};

/**
 * Expose the sockets.
 */

exports.sub = sub;
exports.rep = rep;

/**
 * Handle requests.
 */

rep.on('message', function(msg, reply){
  debug('request %j', msg);

  switch (msg.type) {
    case 'get':
      reply(traces[msg.cycle] || {});
      break;
    case 'clear':
      traces[msg.cycle] = {};
      reply();
      break;
    case 'clear all':
      traces = {};
      reply();
      break
  }
});

/**
 * Handle messages.
 */

sub.on('message', function(trace){
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