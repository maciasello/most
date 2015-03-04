/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Pipe = require('../sink/Pipe');

exports.transduce = transduce;

function transduce(transducer, stream) {
	return new Stream(new Transduce(transducer, stream.source));
}

function Transduce(transducer, source) {
	this.transducer = transducer;
	this.source = source;
}

Transduce.prototype.run = function(sink, scheduler) {
	var xf = this.transducer(new Transformer(sink));
	return this.source.run(new TransduceSink(xf, sink), scheduler);
};

function TransduceSink(xf, sink) {
	this.xf = xf;
	this.sink = sink;
}

TransduceSink.prototype.event = function(t, x) {
	this.xf.step(t, x)
};

TransduceSink.prototype.end = function(t, x) {
	this.xf.result(t)
};

TransduceSink.prototype.error = function(t, e) {
	this.sink.error(t, e);
};

function Transformer(sink) {
	this.sink = sink;
}

Transformer.prototype.init = function() {
	return this.sink;
};

Transformer.prototype.step = function(t, x) {
	this.sink.event(t, x)
};

Transformer.prototype.result = function(t) {
	this.sink.end(t);
};