export const initialState = { user: null, loading: true };

export function authReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, loading: false };
    default:
      return state;
  }
}