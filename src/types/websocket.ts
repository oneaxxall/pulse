import { WebSocket as uWSWebSocket } from 'uWebSockets.js';
import { App } from '../app';
import { PresenceMember, PresenceMemberInfo } from '../channels/presence-channel-manager';

export interface WebSocket extends uWSWebSocket<any> {
    sendJson?: (data: any) => void;
    id?: string;
    subscribedChannels?: Set<string>;
    presence?: Map<string, PresenceMember>;
    app?: App;
    user?: any;
    userAuthenticationTimeout?: any;
    timeout?: any;
    appKey?: string;
    ip?: any;
    ip2?: any;
}
