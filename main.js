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

const adapter = new utils.Adapter('intesishome');
let connectTimeout;
let isConnected;
let client;
const FORBIDDEN_CHARS = /[\]\[*,;'"`<>\\\s?]/g;

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

    if (obj) {
        if (obj.native.factor !== undefined) {
            if (obj && value > 64000) {
                value = -(65536 - value);
            }
            value *= obj.native.factor;
        }
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
    intesis.getStatus(adapter.config, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            for (let device in result.devices) {
                if (result.devices.hasOwnProperty(device)) {
                    const deviceId = device.replace(FORBIDDEN_CHARS, '_');

                    // create channel
                    adapter.getForeignObject(adapter.namespace + '.devices.' + deviceId, (err, obj) => {
                        if (!obj) {
                            obj = {
                                _id: 'devices.' + deviceId,
                                common: {
                                    name: device
                                },
                                type: 'channel',
                                native: result.devices[device]
                            };
                            adapter.setForeignObject(adapter.namespace + '.devices.' + deviceId, obj);
                        }
                    });

                    // create states
                    for (let s in result.devices[device].status) {
                        if (!result.devices[device].status.hasOwnProperty(s)) continue;
                        let _obj = result.devices[device].status[s];
                        const id = (_obj.obj._id || ss).toString().replace(FORBIDDEN_CHARS, '_');
                        (function (ss, __obj, _id) {
                            adapter.getForeignObject(adapter.namespace + '.devices.' + deviceId  + '.' + _id, (err, obj) => {
                                if (!obj) {
                                    obj = result.devices[device].status[ss];
                                    obj.obj.type = 'state';
                                    adapter.setForeignObject(adapter.namespace + '.devices.' + deviceId + '.' + _id, obj.obj);
                                }
                            });
                        })(s, _obj, id);

                        updateState('devices.' + deviceId  + '.' + id, _obj.obj, _obj.val);
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
                updateState('devices.' + deviceId.toString().replace(FORBIDDEN_CHARS, '_') + '.' + id.toString(FORBIDDEN_CHARS, '_'), obj, value);
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
