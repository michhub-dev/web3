import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import memeContract from "./utils/memeContract.json";

const App = () => {
  // set useState to store users wallet
  const [usersWallet, setUsersWallet] = useState("");

  // to store all memes
  const [allMemes, setAllMemes] = useState([]);
  
  // store the contract address in a variable 
  const contractAddress = "0xa8Db68b275bB9bA8b73339f5a82548320F10A1d3";
  
    // Variable that reference the abi content 
 // const contractABI = abi.abi; // ABI file is something our web app needs to know how to communicate with our contract

const getAllMemes = async () => {
    try{
      const { ethereum } = window; 

      if (window.ethereum) {
 const provider = new ethers.providers.Web3Provider();
            const signer = provider.getSigner();
        
        const memePortalContract = new ethers.contract(contractAddress, memeContract.abi, signer);

        const memes = memePortalContract.getAllMemes();

        // I only want address, timestamp, and message in my ui
        const cleanedMeme = memes.map( mem => {
          return {
            address: mem.sender,
            timestamp: new Date (mem.timestamp * 100),
            message: mem.message,
          };
        });
   
            // store the data in react state
            setAllMemes(cleanedMeme);
       
      
      } else {
        console.log("ethereum object doesn't exist")
      }
      } catch(error) {
    console.log(error);
    } 
  }
  
  const isWalletConnected = async () => {
    try {
      /*
    * Make sure we have access to window.ethereum 
    */
    const { ethereum } = window;
    
    if (!ethereum) {
      console.log("hey, make sure you have matamask!");
      return;
    } else {
      console.log("yo, you got ethereum", ethereum);
    }
      // check if we're authorized to access the users wallet 
      const accounts = await ethereum.request({ methods: "eth_accounts"}); /**
use this method eth_accounts to see if we're authorized to access any of the accounts in the user's wallet.*/
      
      if (accounts.length !== 0){
        const account = accounts[0];
        console.log("Found an authorize account:",  account);
        setUsersWallet(account)
        //getAllMemes()
      } else {
        console.log("No authorized account found")
      }
  } catch (error){
      console.log(error);
  }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window; 

      if (!ethereum) {
        alert("Get metamask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts"}); /**
use eth_requestAccounts function to ask Metamask to give me access to the user's wallet*/
      
      console.log("connected", accounts[0]);
      setUsersWallet(accounts[0])
      
    } catch (error) {
      console.log(error)
    }
  }
  const meme = async () => {
    try {
      const { ethereum } = window; 

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const memePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

     let count = await memePortalContract.getTotalMemes();
        console.log("Retrieved total meme count...", count.toNumber());


         /*
        * Execute the actual meme from the smart contract
        */
        
        const memeTxn = await memePortalContract.meme(message, { gasLimit: 300000});
        console.log("Mining...", memeTxn.hash);

        await memeTxn.wait();
       console.log("Mined --", memeTxn.hash);

   
        count = await memePortalContract.getTotalMemes();
        console.log("Retrieved total meme count...", count.toNumber());
        
      } else {
        console.log("ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error)
    }
  }

  
  /*
  * this runs our function when the page loads
  */
  useEffect(() => {
    let memePortalContract;
   isWalletConnected();
    
    const oneNewMeme = (from, timestamp, message) =>{
      console.log("newMeme", from, timestamp, message);
      setAllMemes(prevState => [
        ...prevState, 
        {
          address: mem.sender,
            timestamp: new Date (mem.timestamp * 100),
            message: mem.message,
        },
      ]);
    };
    if (window.ethereum) {
      const provider = new ethers.providers.web3provider(window.ethereum);
      const signer = provider.getSigner();

      memePortalContract = new ethers.contract(contractAddress, contractABI, signer);
      memePortalContract.on("NewMeme", oneNewMeme);
    }
    return () => {
      if (memePortalContract) {
        memePortalContract.off("NewMeme", oneNewMeme)
      }
    };
 
  }, []);

  return (
    
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋😍 Hey there!
        </div>

        <div className="bio">
 I am Michy and I am learning blockchain 
         solidity and web3 so that's pretty cool right? 
        Connect your Ethereum wallet and send me memes!

        </div>

        <button className="memeButton" onClick={meme}>
          Send memes!
        </button>

       
        {/*
        * If there is no currentAccount render this button
        */}
        
         {!usersWallet && (
      <button className="memeButton" onClick={connectWallet}> Connect me!</button>
      )}
        
         {getAllMemes.map((mem, index) => {
          return (
        <div key={index} style={{ backgroundColor: "oldLace", marginTop: "16px", padding: "8px" }}>
        
           <div> Address: {mem.sender} </div>
          <div> Time: {mem.timestamp.toString()} </div>
          <div> Message: {mem.message} </div>
        </div>)
          
        })}
      </div>
    </div>
  );
}

export default App







 
  
