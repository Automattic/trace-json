
/**
 * Module dependencies.
 */

var axon = require('axon');

/**
 * Shared socket.
 */

var sock = axon.socket('pub');
sock.format('json');

/**
 * Expose `Tracer`.
 */

module.exports = Tracer;

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
  axon.send({
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
  axon.send({
    id: this.id,
    cycle: this.cycle,
    type: type,
    end: +date
  });
};
