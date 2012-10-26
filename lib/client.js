
/**
 * Module dependencies.
 */

var axon = require('axon')
  , debug = require('debug')('traces')
  , noop = function(){};

/**
 * Shared socket.
 */

var pub = axon.socket('pub');
pub.format('json');
pub.connect(5555);

/**
 * Shared request socket.
 */

var req = axon.socket('req');
req.format('json');
req.connect(5556);

/**
 * Expose `Tracer`.
 */

exports = module.exports = Tracer;

/**
 * Clear all results collected.
 *
 * @param {Function} [fn]
 * @api public
 */

exports.clearAll = function(fn){
  debug('clear all');
  req.send({ type: 'clear all' }, fn || noop);
};

/**
 * Clear results collected for `cycle`.
 *
 * @param {String} cycle
 * @param {Function} [fn]
 * @api public
 */

exports.clear = function(cycle, fn){
  debug('clear %s', cycle);
  req.send({ type: 'clear', cycle: cycle }, fn || noop);
};

/**
 * Fetch all traces for `cycle` and invoke `fn(err, traces)`.
 *
 * @param {String} cycle
 * @param {Function} fn
 * @api public
 */

exports.get = function(cycle, fn){
  debug('get %s', cycle);
  if ('string' != typeof cycle) throw new TypeError('cycle required');
  req.send({ type: 'get', cycle: cycle }, function(res){
    fn(null, res);
  });
};

/**
 * Initialize a new Tracer with the given `id`
 * and `cycle` name.
 *
 * @param {String} cycle
 * @param {String|Number} id
 * @api public
 */

function Tracer(cycle, id) {
  if ('string' != typeof cycle) throw new TypeError('cycle required');
  if (null == id) throw new TypeError('id required');
  this.cycle = cycle;
  this.id = id;
}

/**
 * Trace start of `type` with `date`.
 *
 * @param {String} type
 * @param {Number|Date} date
 * @api public
 */

Tracer.prototype.start = function(type, date){
  pub.send({
    id: this.id,
    cycle: this.cycle,
    type: type,
    start: +date
  });
};

/**
 * Trace end of `type` with `date`.
 *
 * @param {String} type
 * @param {Number|Date} date
 * @api public
 */

Tracer.prototype.end = function(type, date){
  pub.send({
    id: this.id,
    cycle: this.cycle,
    type: type,
    end: +date
  });
};