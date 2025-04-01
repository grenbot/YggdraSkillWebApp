import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';

// Types for subskills structure
export interface Subskill {
  id: string;
  title: string;
  completed: boolean;
}

export type SubskillState = Record<string, Subskill[]>;

export type SubskillAction =
  | { type: 'SET_SUBSKILLS'; nodeId: string; subskills: Subskill[] }
  | { type: 'ADD_SUBSKILL'; nodeId: string; subskill: Subskill };

// Reducer function
function subskillReducer(
  state: SubskillState,
  action: SubskillAction
): SubskillState {
  switch (action.type) {
    case 'SET_SUBSKILLS':
      return { ...state, [action.nodeId]: action.subskills };
    case 'ADD_SUBSKILL':
      return {
        ...state,
        [action.nodeId]: [...(state[action.nodeId] || []), action.subskill],
      };
    default:
      return state;
  }
}

// Context type
interface SubskillContextType {
  state: SubskillState;
  dispatch: Dispatch<SubskillAction>;
}

// Default context value
const defaultValue: SubskillContextType = {
  state: {},
  dispatch: () => {},
};

const SubskillContext = createContext<SubskillContextType>(defaultValue);

export const SubskillProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(subskillReducer, {});

  return (
    <SubskillContext.Provider value={{ state, dispatch }}>
      {children}
    </SubskillContext.Provider>
  );
};

export const useSubskills = () => useContext(SubskillContext);
