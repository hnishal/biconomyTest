import React, { useState, useEffect } from "react";
import detectEthereumProvider from '@metamask/detect-provider';
import './App.css';
import { Biconomy } from "@biconomy/mexa";
import { ethers } from "ethers";
import abi from "./abi";


function App() {
  const [userAddress, setUserAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [value, setValue] = useState(0);

  useEffect(() => {

    async function initialize() {
      let ethProvider = await detectEthereumProvider()
      const biconomy = new Biconomy(
        ethProvider,
        {
          walletProvider: ethProvider,
          apiKey: "9CoTwaU6k.b2fabbab-7ad8-42bd-8e8b-7f28e1e957e1",
          debug: true,
          strictMode: true

        }
      );
      let ethersProvider = new ethers.providers.Web3Provider(biconomy);

      biconomy
        .onEvent(biconomy.READY, async () => {
          let walletSigner = await ethersProvider.getSigner();

          let userAddress = await walletSigner.getAddress();
          setUserAddress(userAddress);
          let contract = new ethers.Contract(
            "0x42Bc4035B596ABcbB66Ef885Bf905FFfD3CD22BE",
            abi,
            biconomy.getSignerByAddress(userAddress)
          );

          setContract(contract);
          var value = await contract.returnCounter();
          console.log("value: " + value.toNumber())
          setValue(value.toNumber());

          let provider = biconomy.getEthersProvider();
          setProvider(provider);
        })
        .onEvent(biconomy.ERROR, (error, message) => {
          console.log(error, message);
        });
    }

    initialize()

  }, []);

  const handleClick = async (event) => {
    event.preventDefault();

    let { data } = await contract.populateTransaction.increment();

    let txParams = {
      data: data,
      to: "0x42Bc4035B596ABcbB66Ef885Bf905FFfD3CD22BE",
      from: userAddress,
      signatureType: "EIP712_SIGN",
    };
    console.log("works till here")
    console.log("Address: " + userAddress);
    try {
      let tx = await provider.send("eth_sendTransaction", [txParams]);

      console.log("Transaction hash : ", tx);
      provider.once(tx, (transaction) => {
        alert("Incremented!");
        console.log(transaction);
      });
    } catch (error) {
      console.log(error);
    }

  };

  return (
    <div className="App">
      <button type="button" onClick={handleClick}>
        Increment
      </button>
      <p>{value}</p>
    </div>
  );
}

export default App;
