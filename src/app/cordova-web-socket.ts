import {Observable, Subject} from 'rxjs';
import {Injectable} from '@angular/core';

declare var CordovaWebsocketPlugin: any;

@Injectable({
    providedIn: 'root'
})

export class CordovaWebSocket {

    private _wsReceiveObserver: Subject<any> = new Subject<string>();
    private _wsCloseObserver: Subject<any> = new Subject<CordovaWebSocketResult>();
    public wsOptions: CordovaWebSocketOptions;
    private _wsId: string;
    public isOpen: boolean = false;
    public url: string;

    accessToken = 'abcdefghiklmnopqrstuvwxyz';
    public defaultWsOptions: CordovaWebSocketOptions = {
        url: 'ws://192.168.0.106:8080/', // check maybe wss?
        timeout: 5000,
        pingInterval: 10000,
        // headers: {Authorization: 'Bearer ' + this.accessToken},
        // acceptAllCerts: false
    };

    constructor() {
        this.wsOptions = this.defaultWsOptions;
    }

    private _handleWsEvent(event: any) {
        let eventType = event['callbackMethod'];
        switch (eventType) {
            case 'onMessage':
                // console.log('message');
                // console.log(event['message']);
                this._wsReceiveObserver.next(event['message']);
                break;
            case 'onClose':
            case 'onFail':
                let closeEvent: CordovaWebSocketResult = {
                    code: event['code'],
                    reason: event['reason'],
                    exception: event['exception']
                };
                this.isOpen = false;
                this.url = '';
                this._wsCloseObserver.next(closeEvent);
                break;
        }
    }

    async connect(): Promise<CordovaWebSocketResult> {
        let self = this;
        return new Promise<CordovaWebSocketResult>((resolve, reject) => {
            CordovaWebsocketPlugin.wsConnect(self.wsOptions,
                ev => self._handleWsEvent(ev),
                success => {
                    self._wsId = success.webSocketId;
                    self.isOpen = true;
                    self.url = self.wsOptions.url;
                    let result: CordovaWebSocketResult = {
                        code: success['code']
                    };
                    resolve(result);
                },
                error => {
                    self._wsId = error.webSocketId;
                    self.isOpen = false;
                    let result: CordovaWebSocketResult = {
                        code: error['code'],
                        reason: error['reason'],
                        exception: error['exception']
                    };
                    reject(result);
                }
            );
        });
    }

    send(message: string) {
        if (this.isOpen && this._wsId != undefined) {
            CordovaWebsocketPlugin.wsSend(this._wsId, message);
        }
    }

    close(code: number, reason: string) {
        if (this.isOpen && this._wsId != undefined) {
            if (code == undefined) {
                code = 1000;
            }
            if (reason == undefined) {
                reason = '';
            }
            CordovaWebsocketPlugin.wsClose(this._wsId, code, reason);
        }
    }

    public get onMessage(): Observable<string> {
        return <Observable<any>> this._wsReceiveObserver;
    }

    public get onClose(): Observable<CordovaWebSocketResult> {
        return <Observable<any>> this._wsCloseObserver;
    }
}

export interface CordovaWebSocketResult {
    code: number;
    reason?: string;
    exception?: string;
}

export interface CordovaWebSocketOptions {
    url: string;
    timeout?: number;
    pingInterval?: number;
    headers?: object;
    acceptAllCerts?: boolean;
}
