
# traces

  Distributed tracing library. Traces are really just a specialized form of
  `log` calls, therefore this module utilizes `Automattic/log-json` under
  the hood.

## About

  Traces works by collecting "cycles", which consist of one or more trace
  calls enabling you to report on the durations of any given subset of a cycle. For
  example an image upload "cycle" may look something like the following, where each
  aspect of this request/response cycled may be "traced" for inspection. Because of
  this association each `Cycle` must have its own "id", which may be unique identifier,
  allowing traces cross-process.

``` js
var http = require('http');
var cycle = require('traces');

var id = 0;
http.createServer(function(){
  var trace = cycle('upload', id++);

  // request comes in, start streaming data
  trace.start('request');
  trace.start('upload');

  // upload complete
  trace.end('upload');

  // resize
  trace.start('resize');

  // resize complete
  trace.end('resize');

  // respond
  trace.end('request');
})
```

## Enabling probes

  To enable a cycle you may use the __TRACE__ environment variable. For example
  to enable all probes simply use `TRACE="*"`, to enable only chat related cycles
  use `TRACE=chat`, for several use spaces or commas `TRACE="chat request"`,
  `TRACE=chat,request`. You may also use wildcards such as `TRACE=chat:*`,
  and negation via `TRACE="* -chat"` to say "everything except chat".

## API

### Cycle(id, name)

  Initialize a new Tracer with the given `id`
  and `name`.

### Cycle#start(type:String, [date]:Number|Date)

  Trace start of `type` with optional `date`.

### Cycle#end(type:String, [date]:Number|Date)

  Trace end of `type` with optional `date`.
