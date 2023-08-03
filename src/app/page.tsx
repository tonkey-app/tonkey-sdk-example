'use client';
import { useState } from 'react';

export default function Home() {
  const [chainId, setChainId] = useState<string>('-3');
  const onChangeChainId: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setChainId(event.target.value);
    };

  const [safeAddress, setSafeAddress] = useState<string>(
    '0:1d898cd7f90ae860760cb577cd59084721292a81d14c5fe31bc2bbb531bdd6c4',
  );
  const onChangeSafeAddress: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setSafeAddress(event.target.value);
    };

  const [ownerAddress, setOwnerAddress] = useState<string>(
    '0:1d898cd7f90ae860760cb577cd59084721292a81d14c5fe31bc2bbb531bdd6c4',
  );
  const onChangeOwnerAddress: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setOwnerAddress(event.target.value);
    };

  const [recipient, setRecipient] = useState<string>('');
  const onChangeRecipient: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setRecipient(event.target.value);
    };

  const [amount, setAmount] = useState<string>('');
  const onChangeAmount: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setAmount(event.target.value);
    };

  const [boc, setBoc] = useState<string>('');
  const onChangeBoc: React.InputHTMLAttributes<HTMLInputElement>['onChange'] = (
    event,
  ) => {
    setBoc(event.target.value);
  };

  const [queryId, setQueryId] = useState<string>('');
  const onChangeQueryId: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setQueryId(event.target.value);
    };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-6">
      <h1 className="text-5xl mb-2">Examples</h1>
      <p className="mb-4 text-red-500">
        NOTE: You need to have openmask installed in your browser in order to
        work
      </p>
      <section>
        <div>
          <label>Chain Id:</label>
          <input type="text" value={chainId} onChange={onChangeChainId} />
        </div>
        <div>
          <label>Safe Address:</label>
          <input
            type="text"
            value={safeAddress}
            onChange={onChangeSafeAddress}
          />
        </div>
        <div>
          <label>Owner Address:</label>
          <input
            type="text"
            value={ownerAddress}
            onChange={onChangeOwnerAddress}
          />
        </div>
        <button>is Owner?</button>
      </section>
      <section>
        <div>
          <label>Recipient:</label>
          <input type="text" value={recipient} onChange={onChangeRecipient} />
        </div>
        <div>
          <label>Amount:</label>
          <input type="text" value={amount} onChange={onChangeAmount} />
        </div>
        <button>Generate Payload</button>
      </section>
      <section>
        <div>
          <label>Order Cell BOC:</label>
          <input type="text" value={boc} onChange={onChangeBoc} />
        </div>
        <button>Sign</button>
        <button>Create Transfer</button>
      </section>
      <section>
        <div>
          <label>Query Id:</label>
          <input type="text" value={queryId} onChange={onChangeQueryId} />
        </div>
        <button>Get Status</button>
        <button>Get Balance</button>
      </section>
    </main>
  );
}
