import React from 'react';
import WalletProvider from './context/WalletProvider'
import Test from './Test'
import './App.css';

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <Test></Test>
      </div>
    </WalletProvider>
  );
}

export default App;
