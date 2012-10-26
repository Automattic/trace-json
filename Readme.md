
# traces

  Distributed tracing library inspired by [zipkin](https://github.com/twitter/zipkin).

## About

  Traces works by collecting "cycles", which consist of one or more trace
  calls enabling you to report on the durations of any given subset of a cycle. For
  example an image upload "cycle" may look something like the following, where each
  aspect of this request/response cycled may be "traced" for inspection.

```js
var Trace = require('traces');
var http = require('http');

var id = 0;
http.createServer(function(){
  var trace = new Trace('upload', id++);

  // request comes in, start streaming data
  trace.start('request', Date.now());
  trace.start('upload', Date.now());

  // upload complete
  trace.end('upload', Date.now());

  // resize
  trace.start('resize', Date.now());

  // resize complete
  trace.end('resize', Date.now());

  // respond
  trace.end('request', Date.now());
})
```

## API

### exports#clearAll([fn]:Function)

  Clear all results collected.

### exports#clear(cycle:String, [fn]:Function)

  Clear results collected for `cycle`.

### exports#get(cycle:String, fn:Function)

  Fetch all traces for `cycle` and invoke `fn(err, traces)`.

### Tracer()

  Initialize a new Tracer with the given `id`
  and `cycle` name.

### Tracer#start(type:String, date:Number|Date)

  Trace start of `type` with `date`.

### Tracer#end(type:String, date:Number|Date)

  Trace end of `type` with `date`.

## License 

(The MIT License)

Copyright (c) 2012 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.