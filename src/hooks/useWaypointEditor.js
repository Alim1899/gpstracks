import { useCallback, useMemo, useReducer } from "react";
import { MAX_WAYPOINTS } from "@/components/Utils/waypoints";

// draft: ახლად დამატებული, ჯერ დაუდასტურებელი წერტილის index (ყოველთვის ბოლოა)
const INITIAL = { waypoints: [], selected: null, draft: null, adding: false };

// დაუდასტურებელი ახალი წერტილის წაშლა
function dropDraft(state) {
  if (state.draft == null) return state;
  return {
    ...state,
    waypoints: state.waypoints.filter((_, i) => i !== state.draft),
    selected: state.selected === state.draft ? null : state.selected,
    draft: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return { ...INITIAL, waypoints: action.list };

    case "add": {
      if (state.waypoints.length >= MAX_WAYPOINTS) return state;
      const index = state.waypoints.length;
      return { waypoints: [...state.waypoints, action.waypoint], selected: index, draft: index, adding: false };
    }

    case "update":
      return {
        ...state,
        waypoints: state.waypoints.map((w, i) => (i === action.index ? { ...w, ...action.patch } : w)),
      };

    case "remove":
      return {
        ...state,
        waypoints: state.waypoints.filter((_, i) => i !== action.index),
        selected: null,
        draft: null,
      };

    // სხვა წერტილის არჩევა: დაუდასტურებელი ახალი იშლება
    case "select":
      if (action.index === state.draft) return state;
      return { ...dropDraft(state), selected: action.index, adding: false };

    // „მზადაა“: ახალი წერტილი რჩება სიაში
    case "confirm":
      return { ...state, selected: null, draft: null };

    // popup დაიხურა (✕, რუკაზე დაწკაპუნება, Escape): დაუდასტურებელი ახალი წერტილი იშლება
    case "close":
      if (state.selected !== action.index && state.draft !== action.index) return state;
      return { ...dropDraft(state), selected: null };

    case "adding":
      return { ...dropDraft(state), adding: action.on, selected: action.on ? null : state.selected };

    default:
      return state;
  }
}

/**
 * წერტილების რედაქტირება: სია, მონიშნული, ახალი (დაუდასტურებელი) წერტილი და დამატების რეჟიმი
 * იყენებს ატვირთვის გვერდიც და ბილიკის გვერდიც
 */
export function useWaypointEditor() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // dispatch სტაბილურია, ამიტომ ფუნქციებიც სტაბილურია (რუკის effect-ები თავიდან არ ეშვება)
  const actions = useMemo(
    () => ({
      reset: (list = []) => dispatch({ type: "reset", list }),
      add: (waypoint) => dispatch({ type: "add", waypoint }),
      update: (index, patch) => dispatch({ type: "update", index, patch }),
      remove: (index) => dispatch({ type: "remove", index }),
      select: (index) => dispatch({ type: "select", index }),
      confirm: () => dispatch({ type: "confirm" }),
      close: (index) => dispatch({ type: "close", index }),
      toggleAdding: (on) => dispatch({ type: "adding", on }),
    }),
    [],
  );

  // შესანახი სია: დაუდასტურებელი ახალი წერტილის გარეშე
  const saved = useMemo(
    () => (state.draft == null ? state.waypoints : state.waypoints.filter((_, i) => i !== state.draft)),
    [state.waypoints, state.draft],
  );

  const isDraft = useCallback((index) => index === state.draft, [state.draft]);

  return { ...state, ...actions, saved, isDraft };
}