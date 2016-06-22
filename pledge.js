'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise () {
    this.state = 'pending';
    this.handlerGroups = [];
}

$Promise.prototype.then = function (succHandler, errHandler) {
    var newDeferral = new Deferral();
    succHandler = (typeof succHandler === 'function') ? succHandler : false;
    errHandler = (typeof errHandler === 'function') ? errHandler : false;
    this.handlerGroups.push({successCb:  succHandler, errorCb: errHandler, forwarder: newDeferral});
    if (this.state !== 'pending') {
        this.callHandlers();
    }
    if(!this.handlerGroups[0].successCb) return this;
    else return this.handlerGroups[0].forwarder.$promise;
};

$Promise.prototype.catch = function (errHandler) {
    return this.then(null, errHandler);
};

$Promise.prototype.callHandlers = function () {
    if (this.state === 'resolved') {
        if (!this.handlerGroups[0].successCb) return;
        this.handlerGroups[0].successCb(this.value);
        this.handlerGroups.shift();
    }
    if (this.state === 'rejected') {
        if (!this.handlerGroups[0].errorCb) return;
        this.handlerGroups[0].errorCb(this.value);
        this.handlerGroups.shift();
    }
};

function Deferral () {
    this.$promise = new $Promise();
}

Deferral.prototype.resolve = function (data) {
    if(this.$promise.state === 'pending') {
        this.$promise.value = data;
        this.$promise.state = 'resolved';
    }
    while (this.$promise.state !== 'pending' && this.$promise.handlerGroups.length) {
            console.log(this.$promise.handlerGroups.length);
            this.$promise.callHandlers();
        }
};

Deferral.prototype.reject = function (reason) {
    if(this.$promise.state === 'pending') {
        this.$promise.value = reason;
        this.$promise.state = 'rejected';
    }
    while (this.$promise.state !== 'pending' && this.$promise.handlerGroups.length)
        this.$promise.callHandlers();
};


function defer () {
    return new Deferral();
}



/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
