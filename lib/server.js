
/**
 * Module dependencies.
 */

var axon = require('axon')
  , debug = require('debug')('traces');

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

sub.on('message', function(msg){
  var id = msg.id;

  // cycle
  var cycle = (traces[msg.cycle] = traces[msg.cycle] || {});
  var trace = (cycle[id] = cycle[id] || {});
  trace.probes = trace.probes || {};

  // start
  if (msg.start) {
    debug('start %j', msg);
    trace.probes[msg.type] = { start: msg.start };
    return;
  }

  // end
  debug('end %j', msg);
  trace.probes[msg.type] = { end: msg.end };
});