
/**
 * Module dependencies.
 */

var debug = require('debug')('trace-json');
var stats = require('./lib/stats');

/**
 * Enabled cycles.
 */

var names = [];
var skips = [];
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
 * Expose `Cycle`.
 */

exports = module.exports = Cycle;

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
  debug('>> %s:%s', this.name, type);
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
  debug('<< %s:%s', this.name, type);
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

  var isEnabled = names.some(function(re){
    return re.test(name);
  });

  if (!isEnabled) return cache[name] = false;

  return cache[name] = true;
}
