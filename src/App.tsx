import React from 'react';
import logo from './logo.svg';
import WalletProvider from './context/WalletProvider'
import './App.css';

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </WalletProvider>
  );
}

export default App;
