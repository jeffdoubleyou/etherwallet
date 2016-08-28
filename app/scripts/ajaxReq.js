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
    web3.eth.getBalance(addr, function(error, result) {
        var data = {
            error: error,
            msg: error,
            data: {
                balance: result
            } 
        };
        return callback(data);
    });
}

ajaxReq.getTransactionData = function(addr, callback) {
    var data = {
        address: addr
    };
    web3.eth.getBalance(addr, "pending", function(error, result) {
        if(error) {
            data.error = error;
            data.msg = error;
            return callback(data);
        }
        else {
            data.balance = result.toNumber();
            web3.eth.getTransactionCount(addr, "pending", function(error, result) {
                if(error) {
                    data.error = error;
                    data.msg = error;
                    return callback(data);
                }
                else {
                    data.nonce = web3.toHex(result);
                    web3.eth.getGasPrice(function(error, result) {
                        if(error) {
                            data.error = error;
                            data.msg = error;
                            return callback(data);
                        }
                        else {
                            data.gasprice = web3.toHex(result.toNumber());
                            data.data = data; // whatever
                            return callback(data);
                        }
                    });
                }
            });
        }
    });
}

ajaxReq.getTransaction = function(addr, callback) {
    web3.eth.getTransaction(addr, function(error, result) {
        var data = {
            error: error,
            msg: error,
            data: result
        };
        console.log(result);
        return callback(data);
    });
}
ajaxReq.sendRawTx = function(rawTx, callback) {
    console.log(rawTx);
    web3.eth.sendRawTransaction(rawTx, function(error, result) {
        var data = {
            error: error,
            msg: error,
            data: result
        };
        return callback(data);
    });
}
ajaxReq.getEstimatedGas = function(txobj, callback) {
    web3.eth.estimateGas(txobj, function(error, result) {
        var data = {
            error: error,
            msg: error,
            data: result
        }
    });
    return callback(data);
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
