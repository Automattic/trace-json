
/**
 * Module dependencies.
 */

var axon = require('axon')
  , debug = require('debug')('traces')
  , stats = require('./stats')
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
 * Trace address.
 */

var addr = process.env.TRACE_ADDR || '0.0.0.0';

/**
 * Shared socket.
 */

var pub = axon.socket('push');
pub.format('json');
pub.connect('tcp://' + addr + ':5555');

/**
 * Shared request socket.
 */

var req = axon.socket('req');
req.format('json');
req.connect('tcp://' + addr + ':5556');

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
 * Get stats for `cycle` and invoke `fn(err, stats)`.
 *
 * @param {String} cycle
 * @param {Function} fn
 * @api public
 */

exports.stats = function(cycle, fn){
  exports.get(cycle, function(err, data){
    if (err) return fn(err);

    var per = {
    	day: {},
    	hour: {},
    	minute: {}
    };

    // compute deltas
    var probes = {};
    for (var id in data) {
      for (var name in data[id].probes) {
        probes[name] = probes[name] || [];
        var probe = data[id].probes[name];
        var delta = probe.end - probe.start;
        if (isNaN(delta)) continue;

        var d = new Date(probe.end);

        var key = d.getDate();
        per.day[key] = per.day[key] || 0;
        per.day[key]++;

        var key = d.getDate() + ':' + d.getHours();
        per.hour[key] = per.hour[key] || 0;
        per.hour[key]++;

        var key = d.getDate() + ':' + d.getHours() + ':' + d.getMinutes();
        per.minute[key] = per.minute[key] || 0;
        per.minute[key]++;

        probes[name].push(delta);
      }
    }

    // stats
    var res = { probes: {}, data: {} };
    for (var name in probes) {
      var data = probes[name];

      res.data[name] = data;

      res.probes[name] = {
        count: data.length,
        total: stats.sum(data) | 0,
        min: stats.min(data) | 0,
        max: stats.max(data) | 0,
        mean: stats.mean(data) | 0,
        stddev: stats.stddev(data) | 0,
        'per day': stats.meanValues(per.day) | 0,
        'per hour': stats.meanValues(per.hour) | 0,
        'per minute': stats.meanValues(per.minute) | 0
      };
    }

    fn(null, res);
  });
};

/**
 * Fetch cycle names and invoke `fn(err, names)`.
 *
 * @param {Function} fn
 * @api public
 */

exports.cycles = function(fn){
  debug('get cycles');
  req.send({ type: 'get cycles' }, function(res){
    fn(null, res);
  });
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

  var enabled = names.some(function(re){
    return re.test(name);
  });

  if (!enabled) return cache[name] = false;

  return cache[name] = true;
}
