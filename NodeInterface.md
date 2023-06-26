# Node Interface

This document shows how to query basic information from the blockchain.

## Current block

The current status can be queried from the RPC endpoint using

```shell
curl https://rpc-eu-1.kyve.network/status
```

**Output**
```json
{
  "jsonrpc": "2.0",
  "id": -1,
  "result": {
    "node_info": {
      "protocol_version": {
        "p2p": "8",
        "block": "11",
        "app": "0"
      },
      "id": "25da6253fc8740893277630461eb34c2e4daf545",
      "listen_addr": "3.76.244.30:26656",
      "network": "kyve-1",
      "version": "0.34.26",
      "channels": "40202122233038606100",
      "moniker": "node",
      "other": {
        "tx_index": "on",
        "rpc_address": "tcp://0.0.0.0:26670"
      }
    },
    "sync_info": {
      "latest_block_hash": "97C5FC3A117E5663DEFBDAB95C92E88ED41C9EFC612D038F3AE89084F50D7BB7",
      "latest_app_hash": "03F14C8EF9F14283FE20EC9EBDFC5C5AB53E6263C7073E3971905A49C879CC67",
      "latest_block_height": "415080",
      "latest_block_time": "2023-04-11T13:07:07.009918921Z",
      "earliest_block_hash": "144269EC6B36319FCB480E27420D59E487709CEF784EC37E39A396E05E9DC437",
      "earliest_app_hash": "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
      "earliest_block_height": "1",
      "earliest_block_time": "2023-03-14T14:03:14Z",
      "catching_up": false
    },
    "validator_info": {
      "address": "3D25781BF83C20282A32670CA2D0A45163A7FE30",
      "pub_key": {
        "type": "tendermint/PubKeyEd25519",
        "value": "hDe8uOrIHBB/WblaIu6ZcbnrFNHzT+RHei/XCbXTwGE="
      },
      "voting_power": "0"
    }
  }
}
```

This response contains a lot of useful information. To query directly
the height, one can do:

```shell
curl -s https://rpc-eu-1.kyve.network/status | jq ".result.sync_info.latest_block_height | tonumber"
```


## Query Block

A block can be queried from the rpc endpoint. For example to query
block `415111` one can do

```shell
curl -s "https://rpc-eu-1.kyve.network/block?height=415111"
```

This returns all the different hashes as well as consensus information.
To get all transactions one can do

```shell
curl -s "https://rpc-eu-1.kyve.network/block?height=415111" | jq .result.block.data.txs
```

**Output**
```json
[
  "Cp8BCpwBCiMvY29zbW9zLnN0YWtpbmcudjFiZXRhMS5Nc2dEZWxlZ2F0ZRJ1CitreXZlMWtyMGZsajhsbTZ4M3hrd3owazM3ajdta25oczQzNzV2ZWtxZjc1EjJreXZldmFsb3BlcjFrcjBmbGo4bG02eDN4a3d6MGszN2o3bWtuaHM0Mzc1dnR4cWZzaxoSCgV1a3l2ZRIJMTY4NDY5MzE1EmgKUQpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQIO8IpKrB2xJfAhr4SPlFU5TmJst7orlU1U6ABOYC6JihIECgIIARjtBxITCg0KBXVreXZlEgQ0MDAwEMTuChpA8joAcQn3yMWZJ8c5cdv4+Vr/BHIihT6FyI93l3st+61dbHFLTImSYSqc4s7ZMO5zPtutrtcG0OSMyFa/jEHHmw=="
]
```

The data returned is the raw proto-encoded message. We highly recommend using
comsjs here. However, if one wants to decode it using the cli one can do

```shell
echo <raw-proto-message> | base64 -d | protoc --decode_raw
```

## Query a transaction from the API

To query a transaction one needs its transaction hash.
The transaction hash is the sha256sum of the raw proto-encoded message.

```shell
echo <raw-proto-message> | base64 -d | sha256sum
```

In the example above the hash can be obtained via
```shell
echo "Cp8BCpwBCiMvY29zbW9zLnN0YWtpbmcudjFiZXRhMS5Nc2dEZWxlZ2F0ZRJ1CitreXZlMWtyMGZsajhsbTZ4M3hrd3owazM3ajdta25oczQzNzV2ZWtxZjc1EjJreXZldmFsb3BlcjFrcjBmbGo4bG02eDN4a3d6MGszN2o3bWtuaHM0Mzc1dnR4cWZzaxoSCgV1a3l2ZRIJMTY4NDY5MzE1EmgKUQpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQIO8IpKrB2xJfAhr4SPlFU5TmJst7orlU1U6ABOYC6JihIECgIIARjtBxITCg0KBXVreXZlEgQ0MDAwEMTuChpA8joAcQn3yMWZJ8c5cdv4+Vr/BHIihT6FyI93l3st+61dbHFLTImSYSqc4s7ZMO5zPtutrtcG0OSMyFa/jEHHmw==" | base64 -d | sha256sum
```

**Output**
```shell
e966695d16667d78f132ca310c556ae0608ad281f386a879af203d4bd0df690a
```

After that one can use the obtained hash to query the transaction
```shell
curl -s https://api-explorer.kyve.network/cosmos/tx/v1beta1/txs/e966695d16667d78f132ca310c556ae0608ad281f386a879af203d4bd0df690a
```

**Again: We highly recommend using comsjs for querying transactions** 


### Reading the transaction result

The transaction query also returns information about the execution of the 
transaction. Using the example above:

```shell
curl -s https://api-explorer.kyve.network/cosmos/tx/v1beta1/txs/e966695d16667d78f132ca310c556ae0608ad281f386a879af203d4bd0df690a | jq .tx_response
```

Some values are encoded with base64 and need to be decoded manually.
If the field `code` is `0`, then the transaction was successful. In this
example the transaction was not successful. The reason can be found in the
`raw_log` field. (In this example: `"raw_log": "out of gas in location: 
ReadFlat; gasWanted: 177988, gasUsed: 178718: out of gas"`) The user did
not provide enough gas.
