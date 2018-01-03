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
let connectTimeout;
let isConnected;
let client;

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    if (state && !state.ack) {
        setImmediate(() => {
            adapter.getObject(id, function (err, obj) {
                if (obj && obj.common) {
                    if (!obj.common.write) {
                        adapter.log.error('Cannot write read only object: ' + id);
                    } else {
                        if (!isConnected || !client) {
                            adapter.log.error('Cannot write "' + id + '" because not connected');
                        } else {
                            let parts = id.split('.');
                            let deviceId = parts[parts.length - 2];
                            if (obj.common.type === 'boolean') {
                                intesis.setBoolean(client, deviceId, obj.native.uid, state.val);
                            } else if (obj.common.type === 'number') {
                                intesis.setInteger(client, deviceId, obj.native.uid, state.val);
                            } else {
                                intesis.setState(client, deviceId, obj.native.uid, state.val);
                            }
                        }
                    }
                } else {
                    adapter.log.error('Unknown state: ' + id);
                }
            });
        });
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', main);

function updateState(id, obj, value) {
    adapter.log.debug(id + ' = ' + value);

    let f = parseFloat(value);
    if (f.toString() === value) value = f;

    if (obj && obj.native.factor !== undefined) {
        value *= obj.native.factor;
    }
    //Temperature shows 32768 if it is not connected or missing
    if (obj && value === 32768) {
        value *= 0;
    }

    if (id.match(/\.POWER_ON_OFF$/)) {
        value = !!value;
    } else if (obj && obj.native && obj.native.states) {
        if (obj.native.states.hasOwnProperty(value)) {
            value = obj.native.states[value];
        }
    }

    adapter.setForeignState(adapter.namespace + '.' + id, value, true);
}

function connect() {
    if (connectTimeout) {
        clearTimeout(connectTimeout);
        connectTimeout = null;
    }

    adapter.config.log = adapter.log;
    intesis.getStatus(adapter.config, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            for (let device in result.devices) {
                if (result.devices.hasOwnProperty(device)) {
                    // create channel
                    adapter.getForeignObject(adapter.namespace + '.devices.' + device, function (err, obj) {
                        if (!obj) {
                            obj = {
                                _id: device,
                                common: {
                                    name: device
                                },
                                type: 'channel',
                                native: result.devices[device]
                            };
                            adapter.setForeignObject(adapter.namespace + '.devices.' + device, obj);
                        }
                    });

                    // create states
                    for (let s in result.devices[device].status) {
                        if (!result.devices[device].status.hasOwnProperty(s)) continue;
                        let _obj = result.devices[device].status[s];
                        (function (ss, __obj) {
                            adapter.getForeignObject(adapter.namespace + '.devices.' + device  + '.' + (__obj.obj._id || ss), function (err, obj) {
                                if (!obj) {
                                    obj = result.devices[device].status[ss];
                                    obj.obj.type = 'state';
                                    adapter.setForeignObject(adapter.namespace + '.devices.' + device + '.' + (__obj.obj._id || ss), obj.obj);
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

            opts.onConnect = function (_isConnected) {
                isConnected = _isConnected;
                adapter.log.debug('Connected: ' + isConnected);
                adapter.setState('info.connection', isConnected, true);
                if (!isConnected && !connectTimeout) {
                    connectTimeout = setTimeout(connect, adapter.config.reconnectTimeout || 10000);
                }
                if (isConnected && connectTimeout) {
                    clearTimeout(connectTimeout);
                    connectTimeout = null;
                }
            };
            opts.onError = function (error) {
                adapter.log.error(error);
                adapter.setState('info.connection', false, true);
                isConnected = false;
                if (!connectTimeout) {
                    connectTimeout = setTimeout(connect, adapter.config.reconnectTimeout || 10000);
                }
            };
            opts.onData = function (deviceId, id, value, obj) {
                updateState('devices.' + deviceId + '.' + id, obj, value);
            };

            // start timer if server does not response
            if (!connectTimeout) {
                connectTimeout = setTimeout(connect, adapter.config.reconnectTimeout || 10000);
            }

            // try to create TCP connection
            client = intesis.createConnection(opts);
        }
    });
}
function main() {
    adapter.setState('info.connection', false, true);
    adapter.subscribeForeignStates(adapter.namespace + '.devices.*');
    connect();
}
