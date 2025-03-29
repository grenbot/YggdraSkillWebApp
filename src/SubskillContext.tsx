import React, { createContext, useContext, useReducer } from 'react';

// Define action types
const TOGGLE_SUBSKILL = 'TOGGLE_SUBSKILL';
const INIT_SUBSKILLS = 'INIT_SUBSKILLS';

// Define the reducer for subskill management
const subskillReducer = (state, action) => {
  switch (action.type) {
    case INIT_SUBSKILLS:
      return {
        ...state,
        [action.payload.nodeId]: action.payload.subskills,
      };

    case TOGGLE_SUBSKILL: {
      const { nodeId, subskill } = action.payload;
      const currentNodeSubskills = state[nodeId] || [];
      const updatedSubskills = currentNodeSubskills.includes(subskill)
        ? currentNodeSubskills.filter((s) => s !== subskill)
        : [...currentNodeSubskills, subskill];

      return {
        ...state,
        [nodeId]: updatedSubskills,
      };
    }

    default:
      return state;
  }
};

// Create context
const SubskillContext = createContext();

// Create provider
export const SubskillProvider = ({ children }) => {
  const [state, dispatch] = useReducer(subskillReducer, {});

  const initializeSubskills = (nodeId, subskills) => {
    dispatch({ type: INIT_SUBSKILLS, payload: { nodeId, subskills } });
  };

  const toggleSubskill = (nodeId, subskill) => {
    dispatch({ type: TOGGLE_SUBSKILL, payload: { nodeId, subskill } });
  };

  return (
    <SubskillContext.Provider value={{ state, initializeSubskills, toggleSubskill }}>
      {children}
    </SubskillContext.Provider>
  );
};

// Custom hook to use the SubskillContext
export const useSubskills = () => {
  const context = useContext(SubskillContext);
  if (!context) {
    throw new Error('useSubskills must be used within a SubskillProvider');
  }
  return context;
};
