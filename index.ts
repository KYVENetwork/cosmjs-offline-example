import { calculateFee, coins, MsgSendEncodeObject, SigningStargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

// KYVEs official testnet ("Kaon")
const CHAIN_ID = "kaon-1"
const ENDPOINT = "https://rpc-eu-1.kaon.kyve.network"

// Dummy wallet with 10 $KYVE. In production one should also use a 24 word mnemonic.
// It is also possible creating a wallet without mnemonic and just the private key.
const MNEMONIC = "<enter> <your> <menominc>";

// Account number and sequence can be obtained via
// https://api-eu-1.kaon.kyve.network/cosmos/auth/v1beta1/accounts/kyve17tjql5h3kg2kw5uqngrxz9n4735y7vk3j2d37e
const ACCOUNT_NUMBER = 7057;
// After running successfully running this script, this number needs to be incremented.
// Otherwise, script will fail with account sequence mismatch.
let ACCOUNT_SEQUENCE = 1;

(async () => {
  // Online part
  // To sign messages offline, one needs to obtain the accountNumber and sequence.
  // The accountNumber is unique for every address. The sequence is incremented everytime
  // a transaction is mined into a block.
  // Therefore, one needs to manually increment to sequence, everytime a transaction is performed.

  // First, create a wallet out of a mnemonic. The prefix for all KYVE chains is "kyve"
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {prefix: "kyve"})
  const offlineAccount = (await wallet.getAccounts())[0]

  // Obtain the offline signer
  const client = await SigningStargateClient.offline(wallet, {})

  const fee = calculateFee(200000, "0.02tkyve")
  const signingData = { chainId: CHAIN_ID, sequence: ACCOUNT_SEQUENCE, accountNumber: ACCOUNT_NUMBER }

  // Send 1 $KYVE to yourself
  const sendMsg: MsgSendEncodeObject = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: offlineAccount.address,
      toAddress: offlineAccount.address,
      amount: coins("1000000", "tkyve"),
    },
  };

  // Build and sign transaction (offline)
  const txRaw = await client.sign(offlineAccount.address, [sendMsg], fee, "offline transaction-1", signingData)
  const txBytes = TxRaw.encode(txRaw).finish();

  // Create broadcast client (this part needs an internet connection)
  const dummyOfflineWallet = await DirectSecp256k1HdWallet.generate(12)
  const broadcastClient = await SigningStargateClient.connectWithSigner(ENDPOINT, dummyOfflineWallet)

  // Broadcast and print result
  const result = await broadcastClient.broadcastTx(txBytes)
  console.log(result)
})();
