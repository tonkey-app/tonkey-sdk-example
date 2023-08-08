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
  useTxQueue,
} from 'tonkey-gateway-typescript-sdk';

const { Address } = TonWeb;

const connectOpenmask = async () => {
  await window.openmask.provider.send('ton_requestAccounts');
};

const toRawAddress = (address: string) =>
  address && address.length === 48 ? new Address(address).toString(false) : '';

export default function Home() {
  const [chainId, setChainId] = useState<string>('-239');
  const [safeAddress, setSafeAddress] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [createTransferStatus, setCreateTransferStatus] = useState<string>('');
  const [expiredTimeMs, setExpiredTimeMs] = useState<number>(0);
  const [isGettingStatus, setIsGettingStatus] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<string>('');

  const { createTransfer } = useCreateNativeTransfer();
  const { data: balance, refetch: refetchBalance } = useGetBalanceBySafeAddress(
    safeAddress,
    chainId,
  );
  const { data: transactionsInQueue, refetch: refetchTransactionsInQueue } =
    useTxQueue(safeAddress, chainId);

  const onChangeChainId: React.SelectHTMLAttributes<HTMLSelectElement>['onChange'] =
    (event) => {
      setChainId(event.target.value);
    };

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
      await connectOpenmask();
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
    // important: fill in the signature in the index as same the owner index
    // owner index = owner's order in owner list
    // e.g. owner list = [owner 1, owner 2, owner 3]
    // owner 2 wanna create transaction
    // signatures = ["", SIGNATURE_OF_OWNER_2, ""]
    const signatures = new Array(safeInfo.owners.length).fill('');
    for (let i = 0, maxI = signatures.length; i < maxI; i++) {
      if (safeInfo.owners[i].address === toRawAddress(ownerAddress)) {
        signatures[i] = signature;
      }
    }

    const payload = await getTransferpayload({
      signatures,
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

    const result = await createTransfer({ variables: { content: payload } });
    setCreateTransferStatus(
      result.data?.createTransfer.success ? 'Success' : 'Fail',
    );
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
    refetchBalance({ chainId, safeAddress });
  }, [chainId, refetchBalance, safeAddress]);

  const onClickGetStatus = useCallback(() => {
    setIsGettingStatus(true);
    refetchTransactionsInQueue();
  }, [refetchTransactionsInQueue]);

  useEffect(() => {
    if (isGettingStatus) {
      for (const transaction of transactionsInQueue) {
        const {
          summary: { status, multiSigExecutionInfo },
        } = transaction;

        if (queryId === multiSigExecutionInfo?.queryId) {
          setTransactionStatus(status);
        }
      }

      setIsGettingStatus(false);
    }
  }, [isGettingStatus, queryId, transactionsInQueue]);

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
          <select onChange={onChangeChainId} value={chainId}>
            <option value="-239">mainnet (-239)</option>
            <option value="-3">testnet (-3)</option>
          </select>
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
        <button onClick={onClickGeneratePayload} className="mt-3 mb-6">
          Generate Payload
        </button>
        <div>
          <label>Order Cell BOC:</label>
          <input type="text" value={boc} readOnly />
        </div>
        <div>
          <label>Query Id:</label>
          <input type="text" value={queryId} readOnly />
        </div>
      </section>
      <section>
        <button onClick={onClickSign} className="mt-0 mb-3">
          Sign
        </button>
        {signature && (
          <span className="max-w-[400px] mt-4 m-auto break-words">
            {signature}
          </span>
        )}
        <br />
        <button className="mb-3" onClick={onClickCreateTransfer}>
          Create Transfer
        </button>
        {createTransferStatus && (
          <span className="block max-w-[400px] m-auto break-words">
            {createTransferStatus}
          </span>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center gap-x-2">
          <button className="m-0" onClick={onClickGetStatus}>
            Get Transaction Status
          </button>
          <div className="w-[250px] m-0 pl-2 leading-[34px] bg-[#1f1f1f]/50 text-white">
            Status: {transactionStatus}
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
