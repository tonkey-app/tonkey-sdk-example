'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import TonWeb from 'tonweb';
import * as ton3 from 'ton3-core';
import { MultiSig } from 'tonkey-sdk';
import {
  useWalletByAddress,
  useCreateNativeTransfer,
  getTransferpayload,
  TransferParams,
  useGetBalanceBySafeAddress,
} from 'tonkey-gateway-typescript-sdk';

const { Address } = TonWeb;

const toRawAddress = (address: string) =>
  address && address.length === 48 ? new Address(address).toString(false) : '';

export default function Home() {
  const [chainId, setChainId] = useState<string>('-3');
  const [safeAddress, setSafeAddress] = useState<string>(
    'EQADExxcNiblNmwHRdHPk4ZHx_bez9ylxNpJl_ZT_FLEsytZ',
  );
  const [signature, setSignature] = useState<string>('');
  const [expiredTimeMs, setExpiredTimeMs] = useState<number>(0);
  const { createTransfer } = useCreateNativeTransfer();
  const { data: balance, refetch } = useGetBalanceBySafeAddress(
    safeAddress,
    chainId,
  );

  const onChangeChainId: React.InputHTMLAttributes<HTMLInputElement>['onChange'] =
    (event) => {
      setChainId(event.target.value);
    };

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
  const [orderCell, setOrderCell] = useState<ton3.Cell>();
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
    const {
      orderCell,
      queryId: nextQueryId,
      expiredTimeMs: nextExpiredTimeMs,
    } = MultiSig.createOrder(safeInfo.walletId, [message]);

    setOrderCell(orderCell);
    setBoc(new ton3.BOC([orderCell]).toString());
    setQueryId(nextQueryId);
    setExpiredTimeMs(nextExpiredTimeMs);
  }, [amount, recipient, safeInfo.walletId]);

  const onClickSign = useCallback(async () => {
    if (orderCell) {
      setSignature(
        await MultiSig.signOrder(
          orderCell,
          async (orderCellHash) =>
            await window.openmask.provider.send('ton_rawSign', {
              data: orderCellHash,
            }),
        ),
      );
    }
  }, [orderCell]);

  const onClickCreateTransfer = useCallback(async () => {
    const payload = await getTransferpayload({
      signatures: [signature],
      wallet: {
        address: ownerAddress,
        chain: chainId,
      },
      queryId,
      safe: safeInfo,
      recipient,
      orderCellBoc: boc,
      expiredTime: expiredTimeMs.toString(),
      amount: new ton3.Coins(amount).toNano(),
      tokenInfo: balance!.assets[0].tokenInfo,
    } as unknown as TransferParams);
    console.log(payload);
    // {
    //   "chainId": "-3",
    //   "safeAddress": "0:03131C5C3626E5366C0745D1CF938647C7F6DECFDCA5C4DA4997F653FC52C4B3",
    //   "transfer": {
    //       "direction": "OUTGOING",
    //       "recipient": "kQBm6b0ORvMR2M876U7ps9Ul-i-BnmooVNb-qFwAw0TncwF0",
    //       "sender": "0:66E9BD0E46F311D8CF3BE94EE9B3D525FA2F819E6A2854D6FEA85C00C344E773",
    //       "transferInfo": {}
    //   },
    //   "multiSigExecutionInfo": {
    //       "orderCellBoc": "b5ee9c7241010201004400011a00005dc38a69ca7c000000010301006462003374de87237988ec679df4a774d9ea92fd17c0cf35142a6b7f542e0061a273b9901f4000000000000000000000000000ada38547",
    //       "confirmations": [
    //           "84d05e0c704dc542a967b3ebb86ae95d5c3966b71b928493ad09962748531447510bb95ebe12da66d968bf9e38ac9ba71f903d0f2734f2e918f929d63e8bab08"
    //       ],
    //       "confirmationsRequired": 1,
    //       "confirmationsSubmitted": 1,
    //       "executor": "",
    //       "expiredAt": 2322188924000,
    //       "queryId": "8a69ca7c00000001"
    //   }
    // }

    const result = await createTransfer({ variables: { content: payload } });
    console.log(result);
    // {
    //   "data": {
    //       "createTransfer": {
    //           "success": false,
    //           "error": {
    //               "code": "10203002",
    //               "detail": "invalid confirmations format",
    //               "extra": "",
    //               "__typename": "Error"
    //           },
    //           "__typename": "ResBody"
    //       }
    //   }
    // }
  }, [
    amount,
    balance,
    boc,
    chainId,
    createTransfer,
    expiredTimeMs,
    ownerAddress,
    queryId,
    recipient,
    safeInfo,
    signature,
  ]);

  const onClickGetBalance = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const connectOpenmask = async () => {
      await window.openmask.provider.send('ton_requestAccounts');
    };

    connectOpenmask();
  }, []);

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
          <input type="text" value={boc} readOnly />
        </div>
        <div>
          <label>Query Id:</label>
          <input type="text" value={queryId} readOnly />
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
          <button className="m-0" onClick={onClickGetBalance}>
            Refetch Balance
          </button>
          <div className="w-[250px] m-0 pl-2 leading-[34px] bg-[#1f1f1f]/50 text-white">
            Balance: {balance?.fiatTotal}
          </div>
        </div>
      </section>
    </main>
  );
}
