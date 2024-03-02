import { InjectableRxStompConfig } from '@stomp/ng2-stompjs';

export const myRxStompConfig: InjectableRxStompConfig= {
    
    connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },

    brokerURL: `ws://localhost:8090/ichat?access_token=${localStorage.getItem('token')}`,

    heartbeatIncoming: 0,

    heartbeatOutgoing: 20000,

    reconnectDelay: 200,

    debug: (msg: string): void => {
        console.log(new Date(), msg);
    }
};