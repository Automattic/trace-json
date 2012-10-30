
/**
 * Module dependencies.
 */

var axon = require('axon')
  , debug = require('debug')('traces')
  , noop = function(){};

/**
 * Enabled cycles.
 */

var names = []
var skips = []
var cache = {};

(process.env.TRACE || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

/**
 * Shared socket.
 */

var pub = axon.socket('push');
pub.format('json');
pub.connect(5555);

/**
 * Shared request socket.
 */

var req = axon.socket('req');
req.format('json');
req.connect(5556);

/**
 * Expose `Cycle`.
 */

exports = module.exports = Cycle;

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
 * Initialize a new Cycle with the given `id` and `name`.
 *
 * @param {String} name
 * @param {String|Number} id
 * @api public
 */

function Cycle(name, id) {
  if (!(this instanceof Cycle)) return new Cycle(name, id);
  if ('string' != typeof name) throw new TypeError('cycle name required');
  if (null == id) throw new TypeError('id required');
  this.name = name;
  this.id = id;
  if (!enabled(name)) {
    this.start = function(){};
    this.end = function(){};
  }
}

/**
 * Trace start of `type` with `date`.
 *
 * @param {String} type
 * @param {Number|Date} [date]
 * @api public
 */

Cycle.prototype.start = function(type, date){
  pub.send({
    id: this.id,
    cycle: this.name,
    type: type,
    start: +(date || Date.now())
  });
};

/**
 * Trace end of `type` with `date`.
 *
 * @param {String} type
 * @param {Number|Date} [date]
 * @api public
 */

Cycle.prototype.end = function(type, date){
  pub.send({
    id: this.id,
    cycle: this.name,
    type: type,
    end: +(date || Date.now())
  });
};

/**
 * Check if `name` is enabled or explicitly disabled.
 *
 * @param {String} name
 * @return {Boolean}
 * @api false
 */

function enabled(name) {
  if (null != cache[name]) return cache[name];

  var disabled = skips.some(function(re){
    return re.test(name);
  });

  if (disabled) return cache[name] = false;

  var enabled = names.some(function(re){
    return re.test(name);
  });

  if (!enabled) return cache[name] = false; 

  return cache[name] = true;
}