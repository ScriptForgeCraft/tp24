export const initialHistory = (design) => ({
  past: [],
  present: design,
  future: [],
  pending: null,
  pendingFuture: null,
});
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function editorReducer(state, action) {
  if (action.type === "cancel")
    return state.pending
      ? {
          ...state,
          present: state.pending,
          future: state.pendingFuture || [],
          pending: null,
          pendingFuture: null,
        }
      : state;
  if (action.type === "commit") {
    if (!state.pending) return state;
    return {
      ...state,
      past: same(state.pending, state.present)
        ? state.past
        : [...state.past, state.pending].slice(-100),
      pending: null,
      pendingFuture: null,
    };
  }
  if (action.type === "change") {
    const next =
      typeof action.value === "function"
        ? action.value(state.present)
        : action.value;
    if (same(next, state.present)) return state;
    if (action.continuous)
      return {
        ...state,
        present: next,
        pending: state.pending || state.present,
        pendingFuture: state.pending ? state.pendingFuture : state.future,
        future: [],
      };
    const committed = editorReducer(state, { type: "commit" });
    return {
      past: [...committed.past, committed.present].slice(-100),
      present: next,
      future: [],
      pending: null,
    };
  }
  const committed = editorReducer(state, { type: "commit" });
  if (action.type === "undo" && committed.past.length)
    return {
      past: committed.past.slice(0, -1),
      present: committed.past.at(-1),
      future: [committed.present, ...committed.future],
      pending: null,
    };
  if (action.type === "redo" && committed.future.length)
    return {
      past: [...committed.past, committed.present],
      present: committed.future[0],
      future: committed.future.slice(1),
      pending: null,
    };
  return committed;
}
