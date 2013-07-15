
/**
 * Sum.
 */

exports.sum = function(data){
  var n = 0;
  for (var i = 0; i < data.length; i++) {
    n += data[i];
  }
  return n;
};

/**
 * Mean.
 */

exports.mean = function(data){
  var sum = exports.sum(data);
  return sum / data.length;
};

/**
 * Mean values.
 */

exports.meanValues = function(obj){
	var data = Object.keys(obj).map(function(key){
		return obj[key];
	});

	return exports.mean(data);
};

/**
 * Variance.
 */

exports.variance = function(data){
  var m = exports.mean(data);
  var d = [];
  for (var i = 0; i < data.length; i++) {
    d.push(Math.pow(data[i] - m, 2));
  }
  return exports.mean(d);
};

/**
 * Standard deviation.
 */

exports.stddev = function(data){
  return Math.sqrt(exports.variance(data));
};

/**
 * Min.
 */

exports.min = function(data){
  var n = data[0];
  for (var i = 1; i < data.length; i++) {
    n = n < data[i] ? n : data[i];
  }
  return n;
};

/**
 * Max.
 */

exports.max = function(data){
  var n = data[0];
  for (var i = 1; i < data.length; i++) {
    n = n > data[i] ? n : data[i];
  }
  return n;
};
