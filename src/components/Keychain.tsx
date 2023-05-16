import { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import axios, { AxiosError } from 'axios';
import Table from './Table';
import port from '../../backend/port';

export interface KeychainItem extends Record<string, string | number | undefined> {
  agrp: string;
  cdat: string;
  musr: string;
  pdmn: string;
  persistref: string;
  sha1: string;
  sync: number;
  tomb: number;
  v_Data: string;

  acct?: string;
  asen?: number;
  atag?: string;
  atyp?: string;
  bsiz?: number;
  cenc?: number;
  crtr?: number;
  ctyp?: number;
  decr?: number;
  desc?: string;
  drve?: number;
  edat?: string;
  encr?: number;
  esiz?: number;
  extr?: number;
  gena?: string;
  icmt?: string;
  invi?: number;
  issr?: string;
  kcls?: number;
  klbl?: string;
  labl?: string;
  mdat?: string;
  modi?: number;
  nega?: number;
  next?: number;
  path?: string;
  pcsi?: string;
  pcsk?: string;
  pcss?: number;
  perm?: number;
  pkhh?: string;
  port?: number;
  priv?: number;
  ptcl?: string;
  sdat?: string;
  sdmn?: string;
  sens?: number;
  sign?: number;
  skid?: string;
  slnr?: string;
  snrc?: number;
  srvr?: string;
  subj?: string;
  svce?: string;
  type?: number;
  unwp?: number;
  UUID?: string;
  vrfy?: number;
  vwht?: string;
  vyrc?: number;
  wrap?: number;
}

export type KeychainType = 'cert' | 'genp' | 'inet' | 'keys';

type Keychain = {
  [type in KeychainType]: {
    items: KeychainItem[];
    total: number;
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const keychainTypesMap: { [key in KeychainType]: string } = {
  cert: 'Certificates',
  genp: 'General Passwords',
  inet: 'Internet Passwords',
  keys: 'Keys',
};

type KeychainProps = {
  backupPath: string;
  password: string;
  backButton: () => void;
};

function Keychain({ backupPath, password, backButton }: KeychainProps): JSX.Element {
  const [data, setData] = useState<Keychain>();
  const [updatedItems, setUpdatedItems] = useState<KeychainItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalIsOpen, setIsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [modalContent, setModalContent] = useState<KeychainItem>();
  const [keychainEncrypting, setKeychainEncrypting] = useState(false);
  const [keychainEdited, setKeychainEdited] = useState(false);

  useEffect(() => {
    async function fetchData() {
      let response;
      try {
        response = await axios.post(
          `http://localhost:${port}/decrypt`,
          {
            path: backupPath,
            password: password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setData(response.data);
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
          alert(error.response.data);
        } else if (error instanceof Error) {
          alert(error.message);
        }
      }
      setIsLoading(false);
    }
    fetchData();
  }, [backupPath, password]);

  function openModal(data: KeychainItem) {
    setKeychainEdited(false);
    setModalContent(data);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function textAreaEdited(textarea: React.ChangeEvent<HTMLTextAreaElement>) {
    setKeychainEdited(JSON.stringify(JSON.parse(textarea.target.value)) !== JSON.stringify(modalContent));
  }

  function saveKeychainItem() {
    let parsedItem: KeychainItem;
    try {
      parsedItem = JSON.parse(textareaRef.current?.value as string);
    } catch (SyntaxError) {
      alert('Invalid JSON.');
      return;
    }

    Object.keys(keychainTypesMap).forEach((type) => {
      const newData = Object.assign({}, data);
      const keychainItems = newData[type as KeychainType];
      keychainItems.items.forEach((item: KeychainItem, index: number) => {
        if (item.persistref === parsedItem.persistref) {
          for (const [k, v] of Object.entries(parsedItem)) {
            keychainItems.items[index][k] = v;
          }
        }
      });

      setData(newData);
    });

    setUpdatedItems((updatedItems) => [...updatedItems, parsedItem]);

    setIsOpen(false);
  }

  function _downloadFile(binaryData: string) {
    const href = window.URL.createObjectURL(new Blob([binaryData]));
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', 'keychain-backup.plist');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadKeychain() {
    setKeychainEncrypting(true);

    let response;
    try {
      response = await axios.post(
        `http://localhost:${port}/update`,
        {
          path: backupPath,
          password: password,
          items: JSON.stringify(updatedItems),
        },
        { responseType: 'blob' }
      );
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        alert(await error.response.data.text());
      } else if (error instanceof Error) {
        alert(error.message);
      }
      setKeychainEncrypting(false);
      return;
    }

    _downloadFile(response.data);

    setKeychainEncrypting(false);
  }

  function discardChanges() {
    setUpdatedItems([]);
  }

  function downloadButtonDisabled() {
    if (keychainEncrypting) {
      return true;
    }
    return updatedItems.length === 0;
  }

  function saveButtonDisabled() {
    return !keychainEdited;
  }

  return (
    <>
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" ariaHideApp={false}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Keychain Item</h5>
            </div>
            <div className="modal-body">
              <textarea ref={textareaRef} onChange={textAreaEdited} defaultValue={JSON.stringify(modalContent, null, 2)} />
            </div>
            <div className="modal-footer">
              <button onClick={saveKeychainItem} type="button" className="btn btn-primary" disabled={saveButtonDisabled()}>
                Save Item
              </button>
              <button onClick={closeModal} type="button" className="btn btn-secondary" data-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <nav className="navbar navbar-light bg-light px-2">
        <button onClick={backButton} type="button" className="btn btn-primary">
          Back
        </button>
        {data && (
          <form className="form-inline">
            <span className="px-2">
              {updatedItems.length} item{updatedItems.length !== 1 && 's'} edited{keychainEncrypting && ' (encrypting…)'}
            </span>
            {updatedItems.length > 0 && (
              <button onClick={discardChanges} type="button" className="btn btn-danger">
                Discard Changes
              </button>
            )}
            &nbsp;
            <button onClick={downloadKeychain} type="button" className="btn btn-primary" disabled={downloadButtonDisabled()}>
              Download Keychain Backup
            </button>
          </form>
        )}
      </nav>

      {isLoading && (
        <div className="authenticate">
          <h1>Decrypting Keychain…</h1>
        </div>
      )}

      {data && (
        <div className="keychain">
          <div className="m-4">
            <p className="text-center fw-bold">{backupPath}</p>
            <ul className="nav nav-tabs justify-content-center">
              {Object.keys(keychainTypesMap).map((type, index) => (
                <li key={type} className="nav-item">
                  <a href={'#' + type} className={'nav-link' + (index === 0 ? ' active' : '')} data-bs-toggle="tab">
                    {keychainTypesMap[type as KeychainType]} ({data[type as KeychainType].total})
                  </a>
                </li>
              ))}
            </ul>
            <div className="tab-content">
              {Object.keys(keychainTypesMap).map((type, index) => (
                <div key={type} className={'tab-pane fade' + (index === 0 ? ' show active' : '')} id={type}>
                  <Table key={type} data={Array.from(data[type as KeychainType].items)} count={data[type as KeychainType].total} openModal={openModal} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Keychain;
