
/**
 * Module dependencies.
 */

var axon = require('axon')
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

exports.clear = function(fn){
  req.send({ type: 'clear all' }, fn || noop);
};

/**
 * Initialize a new Tracer with the given `id`
 * and `cycle` name.
 *
 * @param {String|Number} id
 * @param {String} cycle
 * @api public
 */

function Tracer(id, cycle) {
  if (null == id) throw new TypeError('id required');
  if ('string' != typeof cycle) throw new TypeError('cycle required');
  this.id = id;
  this.cycle = cycle;
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

/**
 * Clear this cycle's results.
 *
 * @param {Function} [fn]
 * @api public
 */

Tracer.prototype.clear = function(fn){
  req.send({ type: 'clear', cycle: this.cycle }, fn || noop);
};

