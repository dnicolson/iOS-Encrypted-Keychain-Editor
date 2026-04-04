import { useCallback, useEffect, useState, MouseEvent } from 'react';
import Keychain from './components/Keychain';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [backupPath, setBackupPath] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [decryptButtonPressed, setDecryptButtonPressed] = useState<boolean>(false);
  const [pathname, setPathname] = useState<string>(window.location.pathname);

  useEffect(() => {
    function onPopState() {
      const nextPathname = window.location.pathname;
      setPathname(nextPathname);
      setDecryptButtonPressed(nextPathname === '/keychain');
    }

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    if (pathname === '/keychain' && (!backupPath || !password)) {
      window.history.replaceState({}, '', '/');
    }
  }, [backupPath, password, pathname]);

  const hasCredentials = Boolean(backupPath && password);
  const currentPathname = pathname === '/keychain' && !hasCredentials ? '/' : pathname;

  function backButton() {
    setDecryptButtonPressed(false);
    window.history.pushState({}, '', '/');
    setPathname('/');
  }

  const decryptionSucceeded = useCallback(() => {
    window.history.pushState({}, '', '/keychain');
    setPathname('/keychain');
  }, []);

  function decryptButton(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (backupPath && password) {
      setDecryptButtonPressed(true);
    }
  }

  return (
    <>
      {decryptButtonPressed || currentPathname === '/keychain' ? (
        <Keychain backupPath={backupPath} password={password} backButton={backButton} onDecrypted={decryptionSucceeded} />
      ) : (
        <div className="authenticate">
          <h1>iOS Keychain Backup Editor</h1>
          <form>
            <div className="mb-3">
              <label htmlFor="backup-path">Backup Path</label>
              <input type="text" className="form-control" id="backup-path" placeholder="Backup Path" onChange={e => setBackupPath(e.target.value)} defaultValue={backupPath} />
            </div>
            <div className="mb-3">
              <label htmlFor="password">Password</label>
              <input type="password" className="form-control" id="password" placeholder="Password" onChange={e => setPassword(e.target.value)} defaultValue={password} />
            </div>
            <button type="submit" className="btn btn-primary" onClick={decryptButton} disabled={!backupPath || !password}>
              Decrypt Keychain
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default App;
