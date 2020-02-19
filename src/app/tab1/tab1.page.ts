import {ChangeDetectorRef, Component} from '@angular/core';
import {CordovaWebSocket} from '../cordova-web-socket';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

    public changedServerAddress;
    public gamePin;
    public nickName;

    public viewToShow = '';

    public dataStartInfoOwner: any = {
        owner: {},
        s_id: -1,
        p_count: -1,
        p_list: {
            players: []
        }
    };

    constructor(
        private cdRef: ChangeDetectorRef,
        public cordovaWebSocket: CordovaWebSocket
    ) {
        this.changedServerAddress = cordovaWebSocket.defaultWsOptions.url;

        this.cordovaWebSocket.onMessage.subscribe(msg => {
            console.log('handle msg');
            console.log(msg);
            const response: any = JSON.parse(msg);
            if (response.view) {
                if (response.data) {
                    if (response.view === 'START_INFO_OWNER') {
                        this.dataStartInfoOwner = response.data;
                    }
                }

                this.viewToShow = response.view;
                console.log('changing view to ' + this.viewToShow);
                this.cdRef.detectChanges(); // very important to update ui
            }

        });

        this.cordovaWebSocket.connect().then(res => {
            console.log(res);
        });
    }

    changeServerAndConnect() {
        console.log(this.changedServerAddress);
        this.cordovaWebSocket.wsOptions.url = this.changedServerAddress;
        this.cordovaWebSocket.connect().then(res => {
            console.log(res);
        });
    }

    joinGame() {
        console.log('Joining to ' + this.gamePin);
    }

    createGame() {
        console.log('Creating a new game');
        const createGameAction = '{\"action\" : \"CREATE_GAME\" }';
        this.cordovaWebSocket.send(createGameAction);
    }

    cancelGame() {
        console.log('Canceling a new game');
        const cancelGameAction = '{\"action\" : \"CANCEL\" }';
        this.cordovaWebSocket.send(cancelGameAction);
    }

    sendNickname() {
        console.log('Sending nickName');
        const nameAction = '{\"name\" : \"' + this.nickName + '\" }';
        this.cordovaWebSocket.send(nameAction);
    }

    startGame() {
        console.log('Starting the game');
        // const nameAction = '{\"name\" : \"' + this.nickName + '\" }';
        // this.cordovaWebSocket.send(nameAction);
    }
}
