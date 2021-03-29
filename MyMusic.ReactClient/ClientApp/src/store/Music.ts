import { Action, Reducer } from 'redux';
import { AppThunkAction } from '.';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface MusicState {
    isLoading: boolean;
    startDateIndex?: number;
    forecasts: Music[];
}

export interface Music {
    id: string;
    name: number;
    artist: Artist;
}
export interface Artist {
    id: string;
    name: number;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestMusicAction {
    type: 'REQUEST_MUSIC';
    startDateIndex: number;
}

interface ReceiveMusicAction {
    type: 'RECEIVE_MUSIC';
    startDateIndex: number;
    forecasts: Music[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestMusicAction | ReceiveMusicAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestMusic: (startDateIndex: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (appState && appState.music && startDateIndex !== appState.music.startDateIndex) {
            fetch(`ReactClient`)
                .then(response => 
                    response.json() as Promise<Music[]>
                )
                .then(data => {
                    console.log(data);
                    dispatch({ type: 'RECEIVE_MUSIC', startDateIndex: startDateIndex, forecasts: data });
                });

            dispatch({ type: 'REQUEST_MUSIC', startDateIndex: startDateIndex });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: MusicState = { forecasts: [], isLoading: false };

export const reducer: Reducer<MusicState> = (state: MusicState | undefined, incomingAction: Action): MusicState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_MUSIC':
            return {
                startDateIndex: action.startDateIndex,
                forecasts: state.forecasts,
                isLoading: true
            };
        case 'RECEIVE_MUSIC':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.startDateIndex === state.startDateIndex) {
                return {
                    startDateIndex: action.startDateIndex,
                    forecasts: action.forecasts,
                    isLoading: false
                };
            }
            break;
    }

    return state;
};
