/**
 *
 * intesishome adapter
 * Copyright (c) maxtox 2017-2018
 */

/* jshint -W097 */
/* jshint strict:false */
/* jslint node: true */
'use strict';

// you have to require the utils module and call adapter function
const utils   = require('./lib/utils');
const intesis = require('./lib/intesishome');

const adapter = utils.adapter('intesishome');

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        adapter.log.info('ack is not set!');
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', main);

function updateState(id, obj, value) {
    adapter.log.debug(id + ' = ' + value);

    let f = parseFloat(value);
    if (f.toString() === value) value = f;

    if (obj.native.factor !== undefined) {
        value *= obj.native.factor;
    }

    adapter.setState(id, value, true);
}

function connect() {
    adapter.config.log = adapter.log;
    intesis.getStatus(adapter.config, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            for (let device in result.devices) {
                if (result.devices.hasOwnProperty(device)) {
                    // create channel
                    adapter.getObject('devices.' + device, function (err, obj) {
                        if (!obj) {
                            obj = {
                                _id: device,
                                common: {
                                    name: device
                                },
                                type: 'channel',
                                native: result.devices[device]
                            };
                            adapter.setObject('devices.' + device, obj);
                        }
                    });
                    // create states
                    for (var s in result.devices[device].status) {
                        if (!result.devices[device].status.hasOwnProperty(s)) continue;
                        var _obj = result.devices[device].status[s];
                        (function (ss, __obj) {
                            adapter.getObject('devices.' + device  + '.' + (__obj.obj.common.name || ss), function (err, obj) {
                                if (!obj) {
                                    obj = result.devices[device].status[ss];
                                    obj.obj.type = 'state';
                                    adapter.setObject('devices.' + device + '.' + (__obj.obj.common.name || ss), obj.obj);
                                }
                            });
                        })(s, _obj);
                        updateState('devices.' + device  + '.' + (_obj.obj.common.name || s), _obj.obj, _obj.val);
                    }
                }
            }

            let opts = {
                ip:     result.ip,
                port:   result.port,
                token:  result.token,
                log:    adapter.log
            };

            opts.onConnect = function (isConnected) {
                adapter.log.debug('Connected: ' + isConnected);
                adapter.setState('info.connection', isConnected, true);
            };
            opts.onError = function (error) {
                adapter.log.error(error);
                setTimeout(connect, adapter.config.reconnectTimeout || 10000);
            };
            opts.onData = function (deviceId, id, value, obj) {
                updateState('devices.' + deviceId + '.' + id, obj, value);
            };
            intesis.createConnection(opts);
        }
    });
}
function main() {
    adapter.setState('info.connection', false, true);
    connect();
}
