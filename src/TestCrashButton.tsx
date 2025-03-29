import React, { useState } from 'react';

const TestCrashButton = () => {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error('This is a simulated render crash!');
  }

  return (
    <button
      onClick={() => setShouldCrash(true)}
      style={{
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
      }}
    >
      Trigger Test Crash
    </button>
  );
};

export default TestCrashButton;
