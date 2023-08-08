# [tonkey-sdk](https://www.npmjs.com/package/tonkey-sdk) guidance

## Getting started

> Navigate to [website](https://tonkey-questbook-example.netlify.app/)

### Step one

1. Fill all fields in `Section one`
2. The gray rectangle in the bottom of the section will show the `Owner address` is the owner of `Safe Address` or not

### Step two

1. Fill in field `Recipient` and `Amount`(should bigger then zero) in `Section two`
2. Click button `Generate Payload`
3. `tonkeu-sdk` will generate payload base on above input and autofill field `Order Cell BOC` and `Query Id`

### Step three

1. Click button `Sign` in `Section three`
2. Extension `OpenMask` will popup and ask for **Connect** (if you haven't connect before) and **Sign**
3. The signature will appear promptly below the button `Sign`
4. Click button `Create Transfer`
5. `tonkeu-sdk` will create transfer with above information

### Step four

- Click button `Get Transaction Status` will get latest status of transaction and show up in the gray rectangle on the right

- Click button `Refetch Balance` will get current balance and reveal in the gray rectangle on the right
