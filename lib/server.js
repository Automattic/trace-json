
/**
 * Module dependencies.
 */

var axon = require('axon')
  , debug = require('debug')('traces');

/**
 * Socket.
 */

var sub = axon.socket('pull');
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
  switch (msg.type) {
    case 'get':
      debug('get %s', msg.cycle);
      reply(traces[msg.cycle] || {});
      break;
    case 'clear':
      debug('clear %s', msg.cycle);
      traces[msg.cycle] = {};
      reply();
      break;
    case 'clear all':
      debug('clear all');
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
  var probes = (trace.probes = trace.probes || {});
  var probe = (probes[msg.type] = probes[msg.type] || {});

  // start
  if (msg.start) {
    debug('start %s %s %j', msg.cycle, msg.type, msg);
    probe.start = msg.start;
    return;
  }

  // end
  debug('end %s %s %j', msg.cycle, msg.type, msg);
  probe.end = msg.end;
});