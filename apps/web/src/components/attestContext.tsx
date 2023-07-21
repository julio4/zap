import { createContext, useContext, useState, useEffect } from 'react';

type AttestContextType = {
  zkApp: any;
  // TODO Add stuff like wallet here etc...
};

const AttestContext = createContext<AttestContextType>({
  zkApp: null,
});

const AttestProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [attest, setAttest] = useState<AttestContextType>({
    zkApp: null,
  });

  return (
    <AttestContext.Provider value={attest}>
      {children}
    </AttestContext.Provider>
  );
}

export { AttestContext, AttestProvider };
