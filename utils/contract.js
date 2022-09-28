import { ethers } from 'ethers'

import makesickoNFT from './makesickoNFT.json';

export const CONTRACT_ADDRESS = "0x5c6A66416Ec4701Af84c2e1bCCE1E4fFc7cB1fc3";

export async function getNFTs() {
    const contractLogs = await ethereum.request({
        method: 'eth_getLogs',
        params: [{
          fromBlock: 'earliest',
          toBlock: 'latest',
          address: CONTRACT_ADDRESS,
          topics: ['0x4dddbde8c4ab19f8f1e54f1bbde221513f77441f73c6cc8e4e6a8e65feab23d2']
        }]
    })

    const promises = contractLogs.map(async(log) => {
        const tx = await ethereum.request({ 
            method: 'eth_getTransactionByHash',
            params: [log.transactionHash]
        })

        const inter = new ethers.utils.Interface(makesickoNFT.abi);
        const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value});

        if (decodedInput.args[0].includes('error')) {
            return
        }
        const data = ethers.utils.base64.decode(decodedInput.args[0])

        const string = new TextDecoder().decode(data)
        const nfts = JSON.parse(string)

        return nfts
    })

    const response = await Promise.all(promises)

    return response.filter(value => !!value)
}

export async function mintNFT(nftBase64) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, makesickoNFT.abi, signer);

    console.log("Going to pop wallet now to pay gas...")
    let nftTxn = await connectedContract.makeMakesickoNFT(nftBase64);

    console.log("Mining...please wait.")
    await nftTxn.wait();
    
    console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
}

export async function setListener(cb) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, makesickoNFT.abi, signer);

    connectedContract.on("NewMakesickoNFTMInted", cb);

}
