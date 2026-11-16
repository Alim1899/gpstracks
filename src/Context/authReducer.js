export const initialState = {
  user: null,
  loading: true, // true სანამ Firebase შესვლის სტატუსს გაარკვევს
  error: null,
};

export function authReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { user: action.payload, loading: false, error: null };
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}