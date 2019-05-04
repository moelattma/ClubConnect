import * as Actions from './ActionTypes';

let eventState = { allEvents: [], userEvents: [], clubEvents: [], thisEvent: null };

const eventReducer = (state = eventState, action) => {
    switch (action.type) {
        case Actions.EVENTS_SETALL: 
            state = Object.assign({}, state, { allEvents: action.payload.allEvents } );
            return state;
        case Actions.EVENTS_SETUSER:
            state = Object.assign({}, state, { userEvents: action.payload.userEvents } );
            return state;
        case Actions.EVENTS_SETCLUB:
            state = Object.assign({}, state, { clubEvents: action.payload.clubEvents } );
            return state;
        case Actions.EVENTS_SETCURRENT:
            state = Object.assign({}, state, { thisEvent: action.payload.thisEvent } );
            return state;
        default:
            return state;
    }
}

export default eventReducer;