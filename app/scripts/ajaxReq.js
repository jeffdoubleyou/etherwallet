'use strict';
var http;
var ajaxReq = function() {}
ajaxReq.http = null;
ajaxReq.postSerializer = null;
ajaxReq.SERVERURL = "https://www.kryptonchain.com/rpcwallet";
ajaxReq.COINMARKETCAPAPI = "https://coinmarketcap-nexuist.rhcloud.com/api/";
ajaxReq.pendingPosts = [];
ajaxReq.config = {
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	}
};

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider(ajaxReq.SERVERURL));

ajaxReq.getBalance = function(addr, callback) {
    web3.eth.getBalance(addr, callback);
}
ajaxReq.getClassicBalance = function(addr, callback) {
	this.post({
		balance: addr,
        isClassic: true
	}, callback);
}
ajaxReq.getTransactionData = function(addr, callback) {
	this.post({
		txdata: addr,
        isClassic: false
	}, callback);
}
ajaxReq.getClassicTransactionData = function(addr, callback) {
	this.post({
		txdata: addr,
        isClassic: true
	}, callback);
}
ajaxReq.sendRawTx = function(rawTx, callback) {
	this.post({
		rawtx: rawTx,
        isClassic: false
	}, callback);
}
ajaxReq.sendClassicRawTx = function(rawTx, callback) {
	this.post({
		rawtx: rawTx,
        isClassic: true
	}, callback);
}
ajaxReq.getEstimatedGas = function(txobj, callback) {
	this.post({
		estimatedGas: txobj,
        isClassic: false
	}, callback);
}
ajaxReq.getEthCall = function(txobj, callback) {
	this.post({
		ethCall: txobj,
        isClassic: false
	}, callback);
}
ajaxReq.queuePost = function() {
	var data = this.pendingPosts[0].data;
	var callback = this.pendingPosts[0].callback;
	this.http.post(this.SERVERURL, this.postSerializer(data), this.config).then(function(data) {
		callback(data.data);
		ajaxReq.pendingPosts.splice(0, 1);
		if (ajaxReq.pendingPosts.length > 0) ajaxReq.queuePost();
	});
}
ajaxReq.post = function(data, callback) {
	this.pendingPosts.push({
		data: data,
		callback: callback
	});
	if (this.pendingPosts.length == 1) this.queuePost();
}
ajaxReq.getETHvalue = function(callback) {
	var prefix = "kr";
	this.http.get(this.COINMARKETCAPAPI + prefix).then(function(data) {
		data = data['data']['price'];
		var priceObj = {
			usd: data['usd'].toFixed(6),
			eur: data['eur'].toFixed(6),
			btc: data['btc'].toFixed(6)
		};
		callback(priceObj);
	});
}
module.exports = ajaxReq;
