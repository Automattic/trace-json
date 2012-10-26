
# traces

  Distributed tracing library inspired by [zipkin](https://github.com/twitter/zipkin).

  ![](http://s7.postimage.org/bifvc8mix/trace.png)

## Graphing

  This modules includes no graphing functionality, however the image on this page was generated with [traces-graph](https://github.com/LearnBoost/traces-graph). By using `traces.get(cycle)` you can generate your own reports.

## About

  Traces works by collecting "cycles", which consist of one or more trace
  calls enabling you to report on the durations of any given subset of a cycle. For
  example an image upload "cycle" may look something like the following, where each
  aspect of this request/response cycled may be "traced" for inspection. Because of
  this association each `Cycle` must have its own "id", which may be unique identifier,
  allowing traces cross-process.

```js
var Cycle = require('traces');
var http = require('http');

var id = 0;
http.createServer(function(){
  var trace = new Cycle('upload', id++);

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

## trace(1)

  The `trace(1)` executable is provided with this module, and serves as the in-memory "database" from which your nodes converse via [axon](http://github.com/visionmedia/axon). In the future persistence via pluggable stores may be supported.

## API

### exports#clearAll([fn]:Function)

  Clear all results collected.

### exports#clear(cycle:String, [fn]:Function)

  Clear results collected for `cycle`.

### exports#get(cycle:String, fn:Function)

  Fetch all traces for `cycle` and invoke `fn(err, traces)`.

  The json returned is formatted as follows, keyed by the cycle id.

```json
{
  "0": {
    "probes": {
      "request": {
        "start": 1351270875180,
        "end": 1351270875396
      },
      "resize": {
        "start": 1351270875257,
        "end": 1351270875346
      },
      "save": {
        "start": 1351270875257,
        "end": 1351270875307
      },
      "s3": {
        "start": 1351270875257,
        "end": 1351270875312
      }
    }
  },
  "1": {
    "probes": {
  ...
```

### Cycle(id, name)

  Initialize a new Tracer with the given `id`
  and `name`.

### Cycle#start(type:String, date:Number|Date)

  Trace start of `type` with `date`.

### Cycle#end(type:String, date:Number|Date)

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