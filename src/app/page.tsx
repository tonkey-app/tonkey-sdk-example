'use client';
import { useState, useMemo, useCallback } from 'react';
import TonWeb from 'tonweb';
import * as ton3 from 'ton3-core';
import { MultiSig } from 'tonkey-sdk';
import {
  useWalletByAddress,
  useSignTransaction,
  getSignTransactionPayload,
} from 'tonkey-gateway-typescript-sdk';

const { Address } = TonWeb;

const toRawAddress = (address: string) =>
  address && address.length === 48 ? new Address(address).toString(false) : '';

export default function Home() {
  const [signature, setSignature] = useState<string>('');
  const { signTransaction } = useSignTransaction();

  const [chainId, setChainId] = useState<string>('-3');
  const onChangeChainId: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setChainId(event.target.value);
    };

  const [safeAddress, setSafeAddress] = useState<string>(
    'EQADExxcNiblNmwHRdHPk4ZHx_bez9ylxNpJl_ZT_FLEsytZ',
  );
  const onChangeSafeAddress: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setSafeAddress(event.target.value);
    };

  const [ownerAddress, setOwnerAddress] = useState<string>(
    'kQBm6b0ORvMR2M876U7ps9Ul-i-BnmooVNb-qFwAw0TncwF0',
  );
  const onChangeOwnerAddress: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setOwnerAddress(event.target.value);
    };

  const [recipient, setRecipient] = useState<string>(
    'kQBm6b0ORvMR2M876U7ps9Ul-i-BnmooVNb-qFwAw0TncwF0',
  );
  const onChangeRecipient: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setRecipient(event.target.value);
    };

  const [amount, setAmount] = useState<string>('0.000001');
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
      address: '',
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
    const { orderCell, queryId } = MultiSig.createOrder(safeInfo.walletId, [
      message,
    ]);
    setBoc(new ton3.BOC([orderCell]).toString());
    setQueryId(queryId);
  }, [amount, recipient, safeInfo.walletId]);

  const onClickSign = useCallback(async () => {
    const [cell] = TonWeb.boc.Cell.fromBoc(boc);
    const orderHash = TonWeb.utils.bytesToHex(await cell.hash());
    const newSignature = await window.openmask.provider.send('ton_rawSign', {
      data: orderHash,
    });

    setSignature(newSignature);
  }, [boc]);

  const onClickCreateTransfer = useCallback(async () => {
    const payload = await getSignTransactionPayload(
      chainId,
      signature,
      ownerAddress,
      queryId,
      safeAddress,
    );
    console.log(payload);
    // {
    //   "chainId": "-3",
    //   "ownerAddress": "kQBm6b0ORvMR2M876U7ps9Ul-i-BnmooVNb-qFwAw0TncwF0",
    //   "signature": "2e38483977ee840fab529426306bcdcc050bf2bdacaebe4173ac976548b0f16d7b999ed14ae222f261af340579ef4a5c50591871200e22dc7a085184d16eec0b",
    //   "queryId": "8a6392eb00000001",
    //   "safeAddress": "EQADExxcNiblNmwHRdHPk4ZHx_bez9ylxNpJl_ZT_FLEsytZ"
    // }

    const result = await signTransaction({ variables: { content: payload } });
    console.log(result);
    // {
    //   "data": {
    //       "signTransaction": {
    //           "success": false,
    //           "error": {
    //               "code": "10203003",
    //               "detail": "tx was not found",
    //               "extra": "",
    //               "__typename": "Error"
    //           },
    //           "__typename": "ResBody"
    //       }
    //   }
    // }
  }, [chainId, ownerAddress, queryId, safeAddress, signTransaction, signature]);

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
        <div>
          <label>Query Id:</label>
          <input type="text" value={queryId} />
        </div>
        <button onClick={onClickSign}>Sign</button>
        {signature && (
          <span className="block max-w-[400px] mt-4 m-auto break-words">
            {signature}
          </span>
        )}
        <button className="mb-6" onClick={onClickCreateTransfer}>
          Create Transfer
        </button>
        <div className="flex justify-between items-center gap-x-2">
          <button className="m-0">Get Status</button>
          <div className="w-[250px] m-0 pl-2 leading-[34px] bg-[#1f1f1f]/50 text-white">
            Status:{' '}
          </div>
        </div>
        <div className="flex justify-between items-center gap-x-2">
          <button className="m-0">Get Balance</button>
          <div className="w-[250px] m-0 pl-2 leading-[34px] bg-[#1f1f1f]/50 text-white">
            Balance:{' '}
          </div>
        </div>
      </section>
    </main>
  );
}
