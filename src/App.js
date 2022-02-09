import React from 'react';
import { ethers } from 'ethers';
import lighthouse from 'lighthouse-web3';
import { lighthouseAbi } from './contract_abi/lighthouseAbi.js';

import './App.css';

function App() {

  const [txHash, setTxHash] = React.useState(null);
  const [loader, setLoader] = React.useState(false);

  const uploadFile = async (e) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let chain = "polygon";
    let network = "testnet";

    if(window.ethereum.networkVersion === "137") {
      chain = "polygon";
      network = "mainnet";
    } else if(window.ethereum.networkVersion === "250") {
      chain = "fantom";
      network = "mainnet";
    } else if(window.ethereum.networkVersion === "56") {
      chain = "binance";
      network = "mainnet";
    } else if(window.ethereum.networkVersion === "4002") {
      chain = "fantom";
      network = "testnet";
    } else if(window.ethereum.networkVersion === "80001") {
      chain = "polygon";
      network = "testnet";
    } else if(window.ethereum.networkVersion === "97") {
      chain = "binance";
      network = "testnet";
    } else{
      chain = null;
      network = null;
    }
    
    if(chain){
      setLoader(true);
      const response = await lighthouse.deploy(e);

      const cost = await lighthouse.get_quote(e.target.files[0].size, chain, network);

      const signer = provider.getSigner();
      const contract = new ethers.Contract('0x5e507e4f223364176D0294D1696226f2405f4EeD', lighthouseAbi, provider);
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.store(
        response.cid.toString(),
        {}, // empty config
        { value: ethers.utils.parseEther(cost.total_cost.toFixed(18).toString()) }
      );

      console.log(tx);
      setTxHash(tx.hash);
      setLoader(false);
    } else{
      alert("Please connect to a supported network");
      console.log("Please connect to a supported network");
    }
  }

  return (
    <div className="App">
      <input type="file" onChange={e=>uploadFile(e)} />
      {
        loader?
        <div class="loader"></div>
        :
        null
      }
      {
        txHash?
        <div>Tx Hash: {txHash}</div>
        :
        null
      }
    </div>
  );
}

export default App;