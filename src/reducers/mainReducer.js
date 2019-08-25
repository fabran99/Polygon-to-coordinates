import { CHANGE_STATE } from "../actions/types";

const initialState = {
  error: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case CHANGE_STATE:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}
