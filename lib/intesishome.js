const request = require('request');
const net = require('net');

const CMD_GET_STATUS = '{"status":{"hash":"x"},"config":{"hash":"x"}}';
const URL = 'https://user.intesishome.com/api.php/get/control';
const VERSION = '1.8.5';
const INTESIS_MAP = {
    //???
    1: {
        // MUST CONFIRM OFF
        _id: 'POWER_ON_OFF',
        common: {
            type: 'boolean',
            role: 'switch',
            name: 'Power ON/OFF',
            read: true,
            write: true
        },
        native: {
            states: {0: 'off', 1: 'on'},
            uid: 1
        }
    },
    2: {
        _id: 'USER_MODE',
        common: {
            type: 'string',
            name: 'User Mode',
            role: 'state',
            read: true,
            write: true
        },
        native: {
            states: {0: 'auto', 1: 'heat', 2: 'dry', 3: 'fan', 4: 'cool'},
            uid: 2
        }
    },
    4: {
        _id: 'FAN_SPEED',
        common: {
            type: 'string',
            role: 'state',
            name: 'Fan Speed',
            read: true,
            write: true
        },
        native: {
            states: {0: 'auto', 1: 'quiet', 2: 'low', 3: 'medium', 4: 'high', 5: 'high++', 6: 'MAX'},
            uid: 4
        }
    },
    5: {
        _id: 'UP_DOWN_VANE',
        common: {
            type: 'string',
            role: 'state',
            name: 'Up Down vane',
            read: true,
            write: true
        },
        native: {
            states: {
                0: 'auto',
                1: 'POS1',
                2: 'POS2',
                3: 'POS3',
                4: 'POS4',
                5: 'POS5',
                6: 'POS6',
                7: 'POS7',
                8: 'POS8',
                9: 'STOP',
                10: 'Swing',
                11: 'Remolino'
            },
            uid: 5
        }
    },
    6: {
        _id: 'LEFT_RIGHT_VANE',
        common: {
            type: 'string',
            name: 'Left/right vane',
            role: 'state',
            read: true,
            write: true
        },
        native: {
            states: {
                0: 'auto',
                1: 'POS1',
                2: 'POS2',
                3: 'POS3',
                4: 'POS4',
                5: 'POS5',
                6: 'POS6',
                7: 'POS7',
                8: 'POS8',
                9: 'STOP',
                10: 'Swing',
                11: 'Remolino',
                12: 'Wide'
            },
            uid: 6
        }
    },
    7: {
        _id: 'PULSE_UP_DOWN_VANE',
        common: {
            type: 'number',
            name: 'Pulse up/down vane',
            read: true,
            write: true
        },
        native: {
            states: {0: 'VPosition', 1: 'HPosition', 2: 'VPulse', 3: 'HPulse'},
            uid: 7
        }
    },
    8: {
        _id: 'PULSE_LEFT_RIGHT_VANE',
        common: {
            type: 'number',
            name: 'Pulse left/right vane',
            desc: '',
            read: true,
            write: true
        },
        native: {
            states: {0: 'VPosition', 1: 'HPosition', 2: 'VPulse', 3: 'HPulse'},
            uid: 8
        }
    },
    //???
    9: {
        _id: 'SETPOINT_TEMPERATURE',
        common: {
            type: 'number',
            role: 'level.temperature',
            name: 'Setpoint temperature',
            unit: '°C',
            read: true,
            write: true
        },
        native: {
            //this.mInvalidValue = false;
            //this.mUpperLimit = 300L;
            //this.mLowerLimit = 160L;
            //this.mCurrentTemp = 250L;
            uid: 9,
            factor: 0.1
        }
    },
    10: {
        _id: 'AMBIENT_TEMPERATURE',
        common: {
            type: 'number',
            name: 'Ambient temperature',
            role: 'value.temperature',
            unit: '°C',
            read: true,
            write: false
        },
        native: {
            uid: 10,
            factor: 0.1
        }
    },
    13: {
        _id: 'WORKING_HOURS',
        common: {
            type: 'number',
            name: 'WORKING HOURS',
            role: 'value',
            unit: 'hours',
            read: true,
            write: false
        },
        native: {
            uid: 13
        }
    },
    14: {

        _id: 'ALARM_STATUS',
        common: {
            type: 'string',
            name: 'ALARM STATUS',
            role: 'state',
            read: true,
            write: false
        },
        native: {
            uid: 14
        }
    },
    //???
    15: {
        _id: 'ERROR_CODE',
        common: {
            type: 'string',
            role: 'state',
            name: 'ERROR CODE',
            read: true,
            write: false
        },
        native: {
            //states: {
            //    16: 'API_UNAVAILABLE',
            //    13: 'CANCELED',
            //    10: 'DEVELOPER_ERROR',
            //    1500: 'DRIVE_EXTERNAL_STORAGE_REQUIRED',
            //    8: 'INTERNAL_ERROR',
            //    15: 'INTERRUPTED',
            //    5: 'INVALID_ACCOUNT',
            //    11: 'LICENSE_CHECK_FAILED',
            //    7: 'NETWORK_ERROR',
            //    6: 'RESOLUTION_REQUIRED',
            //    20: 'RESTRICTED_PROFILE',
            //    3: 'SERVICE_DISABLED',
            //    9: 'SERVICE_INVALID',
            //    1: 'SERVICE_MISSING',
            //    19: 'SERVICE_MISSING_PERMISSION',
            //    18: 'SERVICE_UPDATING',
            //    2: 'SERVICE_VERSION_UPDATE_REQUIRED',
            //    17: 'SIGN_IN_FAILED',
            //    4: 'SIGN_IN_REQUIRED',
            //    0: 'SUCCESS',
            //    14: 'TIMEOUT',
            //},
            uid: 15
        },
    },
    34: {
        _id: 'QUITE_MODE',
        common: {
            type: 'boolean',
            name: 'Quite Mode',
            role: 'switch',
            read: true,
            write: true
        },
        native: {
            states: {0: 'off', 1: 'on'},
            uid: 34
        }
    },
    35: {
        _id: 'SETPOINT_MIN_CONFIG',
        common: {
            type: 'number',
            name: 'MIN SETPOINT CONFIG',
            role: 'level.temperature',
            unit: '°C',
            read: true,
            write: true
        },
        native: {
            uid: 35,
            factor: 0.1
        }
    },
    36: {
        _id: 'SETPOINT_MAX_CONFIG',
        common: {
            type: 'number',
            name: 'MAX SETPOINT CONFIG',
            role: 'level.temperature',
            unit: '°C',
            read: true,
            write: true
        },
        native: {
            uid: 36,
            factor: 0.1
        }
    },
    37: {
        _id: 'OUTDOOR_TEMPERATURE',
        common: {
            type: 'number',
            name: 'OUTDOOR TEMPERATURE',
            role: 'value.temperature',
            unit: '°C',
            read: true,
            write: false
        },
        native: {
            uid: 37,
            factor: 0.1
        }
    },
    42: {
        _id: 'CLIMA_MODE',
        common: {
            type: 'string',
            name: 'CLIMA MODE',
            role: 'state',
            read: true,
            write: true
        },
        native: {
            states: {0: 'Comfort', 1: 'Eco', 2: 'Powerful'},
            uid: 42
        }
    },
    44: {
        _id: 'WATER_TANK_MODE',
        common: {
            type: 'string',
            name: 'WATER TANK MODE',
            role: 'state',
            read: true,
            write: true
        },
        native: {
            states: {0: 'Comfort', 1: 'Eco', 2: 'Powerful'},
            uid: 44
        }
    },
    45: {
        _id: 'WATER_TANK_TEMPERATURE',
        common: {
            type: 'number',
            name: 'WATER TANK TEMPERATURE',
            role: 'value.temperature',
            unit: '°C',
            read: true,
            write: false
        },
        native: {
            uid: 45,
            factor: 0.1
        }
    },
    46: {
        _id: 'SOLAR_STATUS',
        common: {
            type: 'string',
            role: 'state',
            name: 'SOLAR STATUS',
            read: true,
            write: false
        },
        native: {
            uid: 46
        }
    },
    48: {
        _id: 'THERMOSHIFT_HEAT_ECO',
        common: {
            type: 'number',
            name: 'THERMOSHIFT HEAT ECO',
            role: 'level.temperature',
            unit: '°C',
            read: true,
            write: true
        },
        native: {
            uid: 48,
            factor: -0.1
        }
    },
    49: {
        _id: 'THERMOSHIFT_COOL_ECO',
        common: {
            type: 'number',
            role: 'level.temperature',
            name: 'THERMOSHIFT COOL ECO',
            unit: '°C',
            read: true,
            write: true
        },
        native: {
                uid: 49,
                factor: -0.1

        }
    },
    50: {
        _id: 'THERMOSHIFT_HEAT_POWERFUL',
        common: {
            type: 'number',
            role: 'level.temperature',
            name: 'THERMOSHIFT HEAT POWERFUL',
            unit: '°C',
            read: true,
            write: true
        },
        native: {
                uid: 50,
                factor: 0.1

        }
    },
    51: {
        _id: 'THERMOSHIFT_COOL_POWERFUL',
        common: {
            type: 'number',
            name: 'THERMOSHIFT COOL POWERFUL',
            role: 'level.temperature',
            unit: '°C',
            read: true,
            write: true
        },
        native: {
                uid: 51,
                factor: 0.1
        }
    },
    52: {
        _id: 'THERMOSHIFT_TANK_ECO',
        common: {
            type: 'number',
            name: 'THERMOSHIFT TANK ECO',
            role: 'level.temperature',
            unit: 'x0,1°C',
            read: true,
            write: true
        },
        native: {
            states: {
                uid: 52,
                factor: -0.1
            }
        }
    },
    53: {
        _id: 'THERMOSHIFT_TANK_POWERFUL',
        common: {
            type: 'number',
            name: 'THERMOSHIFT TANK POWERFUL',
            unit: '°C',
            role: 'level.temperature',
            read: true,
            write: true
        },
        native: {
                uid: 53,
                factor: 0.1

        }
    },
    54: {
        _id: 'ERROR_RESET',
        common: {
            type: 'boolean',
            name: 'ERROR RESET',
            role: 'button',
            read: true,
            write: true
        },
        native: {
                uid: 54
        }
    },
    58: {
        _id: 'OPERATING_MODE',
        common: {
            type: 'string',
            name: 'OPERATING MODE',
            role: 'state',
            read: true,
            write: true
        },
        native: {
            states: {
                0: 'Manteinance',
                1: 'Heat',
                2: 'Heat+Tank',
                3: 'Tank',
                4: 'Cool+Tank',
                5: 'Cool',
                6: 'Auto',
                7: 'AutoTank'
            },
            uid: 58
        }
    },
    //???
    60: {
        _id: 'HEAT_8_10',
        common: {
            type: 'boolean',
            role: 'switch',
            name: 'HEAT 8 10',
            read: true,
            write: true
        },
        native: {
            states: {0: 'off?', 1: 'on?'},
            uid: 60
        }
    },
    //???
    61: {
        _id: 'CONFIG_MODE_MAP',
        common: {
            type: 'string',
            role: 'state',
            name: 'CONFIG MODE MAP',
            read: true,
            write: false
        },
        native: {
                uid: 61
        }
    },
    62: {
        _id: 'RUNTIME_MODE_RESTRICTIONS',
        common: {
            type: 'string',
            name: 'RUNTIME MODE RESTRICTIONS',
            role: 'state',
            read: true,
            write: false
        },
        native: {
                uid: 62
        }
    },
    63: {
        _id: 'CONFIG_HORIZONTAL_VANES',
        common: {
            type: 'string',
            role: 'state',
            name: 'CONFIG_HORIZONTAL_VANES',
            read: true,
            write: false
        },
        native: {
                uid: 63
        }
    },
    64: {
        _id: 'CONFIG_VERTICAL_VANES',
        common: {
            type: 'string',
            name: 'CONFIG VERTICAL VANES',
            role: 'state',
            read: true,
            write: false
        },
        native: {
                uid: 64
        }
    },
    //???
    65: {
        _id: 'CONFIG_QUIET',
        common: {
            type: 'boolean',
            name: 'CONFIG QUIET',
            role: 'switch',
            read: true,
            write: true
        },
        native: {
            states: {0: 'OFF=LOUD', 1: 'ON=QUIET'},
            uid: 65
            // public void onClick(final DialogInterface dialogInterface, final int n) {
            // WOnOffQuiet.this.send(Api.UID.ON_OFF.getVal(), 0L);
            // WOnOffQuiet.this.setPower(WOnOffQuiet.this.mIsOn);
            // wonoffquiet
        }
    },
    //???
    66: {
        _id: 'CONFIG_CONFIRM_OFF',
        common: {
            type: 'boolean',
            name: 'CONFIG CONFIRM OFF',
            role: 'button',
            read: true,
            write: true
        },
        native: {
            //  public long getConfigModeRestrictions() throws UidNotPresentException, InvalidValueException {
            //  return this.getUidValue(Api.UID.RUNTIME_MODE_RESTRICTIONS.getVal())

            //public Boolean getConfigMustConfirmOff() throws UidNotPresentException, InvalidValueException {
            //return this.getUidValue(Api.UID.CONFIG_CONFIRM_OFF.getVal()) != 0L;

            uid: 66
        }
    },
    67: {
        _id: 'CONFIG_FAN_MAP',
        common: {
            type: 'string',
            name: 'CONFIG FAN MAP',
            role: 'state',
            read: true,
            write: false
        },
        native: {
            uid: 67
        }
    },
    68: {
        _id: 'INSTANT_POWER_CONSUMPTION',
        common: {
            type: 'number',
            name: 'INSTANT POWER CONSUMPTION',
            unit: 'kWh',
            role: 'value.consumption',
            read: true,
            write: false
        },
        native: {
            uid: 68,
            factor: 0.001
        }
    },
    69: {
        _id: 'ACCUMULATED_POWER_CONSUMPTION',
        common: {
            type: 'number',
            name: 'ACCUMULATED POWER CONSUMPTION',
            unit: 'kWh',
            role: 'value.consumption',
            read: true,
            write: false
        },
        native: {
            uid: 69,
            factor: 0.001
        }
    },
    70: {
        _id: 'WEEKLY_POWER_CONSUMPTION',
        common: {
            type: 'number',
            name: 'WEEKLY POWER CONSUMPTION',
            unit: 'kWh',
            role: 'value.consumption',
            read: true,
            write: false
        },
        native: {
            uid: 70,
            factor: 0.001
        }
    },
    //???
    75: {
        _id: 'CONFIG_OPERATING_MODE',
        common: {
            type: 'string',
            name: 'CONFIG OPERATING MODE',
            role: 'state',
            read: true,
            write: true
        },
        native: {
            uid: 75
        }
    },
    //???
    77: {
        _id: 'CONFIG_VANES_PULSE',
        common: {
            type: 'string',
            name: 'CONFIG VANES PULSE',
            role: 'state',
            read: true,
            write: true
        },
        native: {
            states: {
                uid: 77
            }
        }
    },
    80: {
        _id: 'AQUAREA_TANK_CONSUMPTION',
        common: {
            type: 'number',
            name: 'AQUAREA TANK CONSUMPTION',
            unit: 'kWh',
            role: 'value.consumption',
            read: true,
            write: false
        },
        native: {
            uid: 80,
            factor: 0.001
        }
    },
    81: {
        _id: 'AQUAREA_COOL_CONSUMPTION',
        common: {
            type: 'number',
            name: 'AQUAREA COOL CONSUMPTION',
            unit: 'kWh',
            role: 'value.consumption',
            read: true,
            write: false
        },
        native: {
            uid: 81,
            factor: 0.001
        }
    },
    82: {
        _id: 'AQUAREA_HEAT_CONSUMPTION',
        common: {
            type: 'number',
            name: 'AQUAREA HEAT CONSUMPTION',
            unit: 'kWh',
            role: 'value.consumption',
            read: true,
            write: false
        },
        native: {
            uid: 82,
            factor: 0.001
        }
    },
    //???
    137: {
        _id: 'FAHRENHEIT_TYPE',
        common: {
            type: 'boolean',
            name: 'FAHRENHEIT TYPE',
            role: 'switch',
            read: true,
            write: true
        },
        native: {
            states: {0: 'Aquarea=Standard=Celsius', 1: 'Fujitsu=Frenheit'}
        }
    },
    140: {
        _id: 'EXTREMES_PROTECTION_STATUS',
        common: {
            type: 'boolean',
            name: 'EXTREMES PROTECTION STATUS',
            role: 'switch',
            read: true,
            write: false
        },
        native: {
            states: {
                0: 'ON=protected', 1: 'OFF=NOT protected for freeze'
            },
            uid: 140
        }
    },
    148: {
        _id: 'EXTREMES_PROTECTION',
        common: {
            type: 'boolean',
            name: 'EXTREMES_PROTECTION',
            role: 'switch',
            read: true,
            write: true
        },
        native: {
            states: {
                states: {0: 'ON=protected', 1: 'OFF=NOT protected for freeze'},
                uid: 148
            }
        }
    },
    149: {
        _id: 'BINARY_INPUT',
        common: {
            type: 'string',
            name: 'BINARY INPUT',
            role: 'state',
            read: true,
            write: false
        },
        native: {
            uid: 149
        }
    },
    //???
    153: {
        _id: 'CONFIG_BINARY_INPUT',
        common: {
            type: 'string',
            name: 'CONFIG BINARY INPUT',
            role: 'state',
           read: true,
            write: true
        },
        native: {
            states: {0: '0', 1: '1', 2: '2', 3: '3',},
            //wbinaryinput2
            uid: 153
        }
    },
    //???
    168: {
        _id: 'UID_BINARY_INPUT_ON_OFF',
        common: {
            type: 'number',
            name: 'UID BINARY INPUT ON OFF',
            role: 'value',
            read: true,
            write: true
        },
        native: {
            //wbinaryinput2
            uid: 168
        }
    },
    //???
    169: {
        _id: 'UID_BINARY_INPUT_OCCUPANCY',
        common: {
            type: 'string',
            name: 'UID BINARY INPUT OCCUPANCY',
            role: 'state',
            read: true,
            write: false
        },
        native: {
            uid: 169
        }
    },
    //???
    170: {
        _id: 'UID_BINARY_INPUT_WINDOW',
        common: {
            type: 'string',
            name: 'UID BINARY INPUT WINDOW',
            role: 'state',
            read: true,
            write: false
        },
        native: {
            uid: 170
        }
    },

    60002: {
        _id: 'rssi',
        common: {
            type: 'number',
            role: 'value.rssi',
            name: 'rssi',
            read: true,
            write: false
        },
        native: {
            uid: 60002
        }
    },
    100000: {
        common: {
            type:  'number',
            read:  true,
            write: false,
            role:  'state'
        },
        native: {
            uid: 100000
        }
    }
};
let seqNr = 0;
// answer is:
// var answert = {
//     "config": {
//         "token": 1656605433,
//         "pushToken": "channel-ee9aecd92c396ac1108ad72106a74dc2",
//         "lastAppVersion": "2.0",
//         "forceUpdate": 0,
//         "setDelay": 0.7,
//         "serverIP": "212.36.84.207",
//         "serverPort": 5220,
//         "hash": "bf0f79841cdca6ae28a7dc059185203a1f732d9e",
//         "inst": [
//             {
//                 "id": 1,
//                 "order": 1,
//                 "name": "First installation",
//                 "devices": [
//                     {
//                         "id": "127934816807",
//                         "name": "AQUAREA JR",
//                         "familyId": 6656,
//                         "modelId": 310,
//                         "installationId": 19833,
//                         "zoneId": 19954,
//                         "order": 1,
//                         "widgets": [
//                             16,
//                             3,
//                             18,
//                             27,
//                             25,
//                             28,
//                             23,
//                             46
//                         ]
//                     }
//                 ]
//             }
//         ]
//     },
//     "status": {
//         "hash": "84f6ad9a8edaec24615190fdf89c03a9915a1cc3",
//         "status": [
//             {
//                 "deviceId": 127934816807,
//                 "uid": 1,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 10,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 14,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 15,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 34,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 37,
//                 "value": 70
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 38,
//                 "value": 270
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 39,
//                 "value": 260
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 42,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 43,
//                 "value": 1
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 44,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 45,
//                 "value": 440
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 46,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 48,
//                 "value": 50
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 49,
//                 "value": 50
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 50,
//                 "value": 50
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 51,
//                 "value": 50
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 52,
//                 "value": 100
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 53,
//                 "value": 100
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 54,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 55,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 56,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 57,
//                 "value": 460
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 58,
//                 "value": 2
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 65,
//                 "value": 2
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 66,
//                 "value": 1
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 69,
//                 "value": 3468708
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 75,
//                 "value": 7
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 80,
//                 "value": 1111106
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 81,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 82,
//                 "value": 2357603
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 83,
//                 "value": 320
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 84,
//                 "value": 200
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 85,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 86,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 87,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 88,
//                 "value": 88
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 89,
//                 "value": 3
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 90,
//                 "value": 309
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 91,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 92,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 93,
//                 "value": 1
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 94,
//                 "value": 60
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 95,
//                 "value": 12
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 96,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 97,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 98,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 99,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 100,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 101,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 102,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 103,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 104,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 105,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 107,
//                 "value": 3477
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 108,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 109,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 110,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 111,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 112,
//                 "value": 1
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 113,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 114,
//                 "value": 1
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 115,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 116,
//                 "value": 250
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 117,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 118,
//                 "value": 5
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 119,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 120,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 121,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 122,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 123,
//                 "value": 85
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 124,
//                 "value": 170
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 125,
//                 "value": 85
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 126,
//                 "value": 85
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 127,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 128,
//                 "value": 85
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 129,
//                 "value": 32768
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 130,
//                 "value": 170
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 131,
//                 "value": 85
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 132,
//                 "value": 85
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 133,
//                 "value": 85
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 134,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 135,
//                 "value": 150
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 136,
//                 "value": 300
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 142,
//                 "value": 1
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 144,
//                 "value": 156
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 181,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 182,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 183,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 184,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 185,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 186,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 187,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 188,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 189,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 190,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 50000,
//                 "value": 1
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 50001,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 50002,
//                 "value": 0
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 50008,
//                 "value": 1
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 50010,
//                 "value": 4
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 60002,
//                 "value": 182
//             },
//             {
//                 "deviceId": 127934816807,
//                 "uid": 60001,
//                 "value": 181
//             }
//         ]
//     }
// };

function getStatus(options, callback) {
    request.post(URL, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache'
        },
        form: {
            username: options.username,
            password: options.password,
            cmd: CMD_GET_STATUS,
            version: VERSION
        }
    }, function (error, status, body) {
        if (!error) {
            let data = JSON.parse(body);
            if (data.errorMessage) {
                options.log && options.log.error(data.errorMessage);
                return;
            }
            let result = {
                ip: data.config.serverIP,
                token: data.config.token,
                port: data.config.serverPort
            };
            if (data.config.inst) {
                result.devices = {};
                for (let i = 0; i < data.config.inst.length; i++) {
                    for (let d = 0; d < data.config.inst[i].devices.length; d++) {
                        let dev = data.config.inst[i].devices[d];
                        result.devices[dev.id] = dev;
                    }
                }
            }
            if (data.status && data.status.status) {
                let status = data.status.status;
                for (let s = 0; s < status.length; s++) {
                    if (result.devices[status[s].deviceId]) {
                        let stat = result.devices[status[s].deviceId];
                        stat.status = stat.status || {};
                        if (INTESIS_MAP[status[s].uid]) {
                            stat.status[INTESIS_MAP[status[s].uid]._id] = {
                                val: status[s].value,
                                obj: INTESIS_MAP[status[s].uid]
                            };
                        } else {
                            console.log('UID [' + status[s].uid + '] ignored: ' + status[s].value);
                            let obj = Object.assign({}, INTESIS_MAP[100000]);
                            if (obj) {
                                obj._id = status[s].uid;
                                obj.native.uid  = status[s].uid;
                                obj.native.name = status[s].uid;
                                stat.status[status[s].uid] = {val: status[s].value, obj: obj};
                            } else {
                                console.log('Unknown uuid: ' + JSON.stringify(100000));
                            }
                        }
                    } else {
                        console.warn('Unknown device ID in status: ' + status[s].deviceId);
                    }
                }
            }
            callback && callback(null, result);
        } else {
            callback && callback(error);
        }
    });
}

function processCommand(options, cmd) {
    let packet;
    try {
        packet = JSON.parse(cmd);
    } catch (e) {
        return false;
    }

    switch (packet.command) {
        case 'connect_rsp':
            // {"command":"connect_rsp","data":{"status":"ok"}}
            if (options.onConnect) options.onConnect(true, packet.data);
            break;

        case 'rssi':
            //{"command":"rssi","data":{"deviceId":127934816807,"value":182}}
            if (options.onData) options.onData(packet.data.deviceId, 'rssi', packet.data.value, INTESIS_MAP[60002]);
            break;

        case 'status':
            // {"command":"status","data":{"rssi":182,"deviceId":127934816807,"uid":60002,"value":182}}
            if (typeof options.onData === 'function') {
                options.onData(
                    packet.data.deviceId,
                    INTESIS_MAP[packet.data.uid] ? INTESIS_MAP[packet.data.uid]._id : packet.data.uid,
                    packet.data.value,
                    INTESIS_MAP[packet.data.uid]);
            }
            break;

        default:
            console.log('Unknown command: ' + JSON.stringify(packet));
            break;
    }
    return true;
}

function createConnection(options) {
    let client = new net.Socket();
    let buffer = '';
    let lastPacket;
    let log    = options.log || console.log;
    client.__log = log;
    client.__onConnect = options.onConnect;

    client.on('error', function (e) {
        log.error('ERROR: ' + e);
        if (options.onError) options.onError(e);
    });

    client.connect(options.port, options.ip, function () {
        log.info('Connected');
        client.write('{"command":"connect_req","data":{"token":' + options.token + '}}');
    });

    client.on('data', function (data) {
        data = data.toString();
        log.debug(data);

        if (lastPacket && Date.now() - lastPacket > 5000) {
            buffer = '';
        } else {
            buffer += data;
        }

        let pos = buffer.indexOf('}{');
        while (pos !== -1) {
            let line = buffer.substring(0, pos + 1);
            buffer = buffer.substring(pos + 1);
            processCommand(options, line);
            pos = buffer.indexOf('}{');
        }
        if (buffer && buffer[buffer.length - 1] === '}') {
            if (processCommand(options, buffer)) {
                buffer = '';
            }
        }
    });

    client.on('close', function () {
        log.info('Connection closed');
        if (options.onConnect) options.onConnect(false);
    });

    return client;
}


const COMMAND_MAP = {
    power:      1,
    mode:       2,
    fan_speed:  4,
    vvane:      5,
    hvane:      6,
    setpoint:   9
};

function findValue(states, textValue) {
    textValue = textValue.toLowerCase();
    for (let id in states) {
        if (states.hasOwnProperty(id)) {
            if (textValue === states[id].toLowerCase()) {
                return id;
            }
        }
    }
    return null;
}

function setInteger(client, deviceId, uid, value) {
    value = parseFloat(value);
    if (isNaN(value)) {
        client.__log.warn('Invalid power value: ' + value);
        return;
    }
    sendCommand(client, deviceId, uid, value);
}

function setState(client, deviceId, uid, value) {
    let f = parseInt(value, 10);
    if (f.toString() === value.toString()) {
        value = f;
    }

    if (typeof value === 'string') {
        if (!INTESIS_MAP[uid]) {
            client.__log.warn('Invalid power value: ' + value);
            return;
        }
        f = findValue(INTESIS_MAP[uid].native.states);
        if (f === null) {
            client.__log.warn('Invalid power value: ' + value);
            return;
        }
        value = f;
    }
    sendCommand(client, deviceId, uid, value);
}

function setBoolean(client, deviceId, uid, value) {
    let f = parseInt(value, 10);
    if (f.toString() === value.toString()) {
        value = f;
    }

    if (typeof value === 'string') {
        if (!INTESIS_MAP[uid]) {
            client.__log.warn('Invalid power value: ' + value);
            return;
        }
        f = findValue(INTESIS_MAP[uid].native.states);
        if (f === null) {
            client.__log.warn('Invalid power value: ' + value);
            return;
        }
        value = f;
    }
    if (value === false) value = 0;
    if (value === true)  value = 1;
    sendCommand(client, deviceId, uid, value);
}

function sendCommand(client, deviceId, uid, value, callback) {
    let message = '{"command":"set","data":{"deviceId":' + deviceId +',"uid":' + uid +',"value":' + value + ',"seqNo":' + seqNr +'}}';
    seqNr++;
    if (seqNr > 0xFFFF) {
        seqNr = 0;
    }
    client.__log.debug(message);
    try {
        client.write(message);
    } catch (e) {
        client.__log.error('Cannot send message: ' + e);
        client.__onConnect(false);
        try {
            client.close();
        } catch (ee) {

        }
    }
}

module.exports.getStatus        = getStatus;
module.exports.sendCommand      = sendCommand;
module.exports.setBoolean       = setBoolean;
module.exports.setState         = setState;
module.exports.setInteger       = setInteger;
module.exports.createConnection = createConnection;

