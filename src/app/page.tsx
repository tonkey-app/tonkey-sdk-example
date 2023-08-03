'use client';
import { useState, useMemo, useCallback } from 'react';
import TonWeb from 'tonweb';
import * as ton3 from 'ton3-core';
import { MultiSig } from 'tonkey-sdk';
import { useWalletByAddress } from 'tonkey-gateway-typescript-sdk';

const { Address } = TonWeb;

const toRawAddress = (address: string) =>
  address && address.length === 48 ? new Address(address).toString(false) : '';

export default function Home() {
  const [chainId, setChainId] = useState<string>('-3');
  const onChangeChainId: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setChainId(event.target.value);
    };

  const [safeAddress, setSafeAddress] = useState<string>('');
  const onChangeSafeAddress: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setSafeAddress(event.target.value);
    };

  const [ownerAddress, setOwnerAddress] = useState<string>('');
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
  const [queryId, setQueryId] = useState<string>('');

  const rawOwnerAddress = useMemo(
    () => toRawAddress(ownerAddress),
    [ownerAddress],
  );

  const {
    safeInfo = {
      owners: [],
      walletId: 0,
    },
  } = useWalletByAddress(safeAddress, chainId);

  const isOwner = useMemo(
    () =>
      rawOwnerAddress &&
      safeInfo.owners.some(({ address }) => address.includes(rawOwnerAddress)),
    [rawOwnerAddress, safeInfo.owners],
  );

  const onClickGeneratePayload = useCallback(() => {
    const message = MultiSig.createBaseCoinTransferMessage(recipient, amount);
    const { orderCell } = MultiSig.createOrder(safeInfo.walletId, [message]);
    setBoc(new ton3.BOC([orderCell]).toString());
  }, [amount, recipient, safeInfo.walletId]);

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

        <div className="pl-2 bg-[#1f1f1f]/50 text-white">
          Result:{' '}
          {safeAddress && ownerAddress && isOwner
            ? 'Safe address owner'
            : 'Not safe address owner'}
        </div>
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
        <button onClick={onClickGeneratePayload}>Generate Payload</button>
      </section>
      <section>
        <div>
          <label>Order Cell BOC:</label>
          <input type="text" value={boc} />
        </div>
        <button>Sign</button>
      </section>
      <section>
        <button className="mb-6">Create Transfer</button>
        <div>
          <label>Query Id:</label>
          <input type="text" value={queryId} />
        </div>
        <button>Get Status</button>
        <button>Get Balance</button>
      </section>
    </main>
  );
}
