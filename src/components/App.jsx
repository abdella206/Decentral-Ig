import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
//import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'



const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

const App = () => {

  const [account, setAccount ] = useState('');
  const [decentragram, setDecentragram ] = useState(null);
  const [images, setImages ] = useState([]);
  const [loading, setLoading ] = useState(true);
  const [buffer, setBuffer ] = useState();

  
//==============================================================================================================================


  useEffect(() => {
    
    loadWeb3();
   loadBlockchainData();
    
    
 
  },[] )

//==============================================================================================================================

  const loadWeb3 = async () => {

    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMaask!')
    }
}

//==============================================================================================================================


  const loadBlockchainData = async () => {
  
    const web3 = window.web3;
  
    // Load account
    const accounts = await web3.eth.getAccounts();

    // set account number in state
    setAccount(accounts[0])

    // Get network id below
    const networkId = await web3.eth.net.getId();

    // get network data based off network id
    const networkData = Decentragram.networks[networkId]

    // If we get back network data base from network id
    if(networkData) {

      const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address)
      setDecentragram(decentragram)

    // Get image count data from blockchain line 69 then set image state line 70
      const imagesCount = await decentragram.methods.imageCount().call()
      setImages( { imagesCount } )

      for (var i = 1; i <= imagesCount; i++) {
        const image = await decentragram.methods.images(i).call()
        images.push(image)
        setImages(images)
      }

    // Sort images. Show highest tipped images first
      setImages(images.sort((a,b) => b.tipAmount - a.tipAmount))
      
      setLoading(false)
      
    } else {
     window.alert('Decentragam contract not deployed to dectectd network')
    }

}


//==============================================================================================================================

 const captureFile = (e) => {
    e.preventDefault()
    const file = e.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      setBuffer(Buffer(reader.result))
      
    }
    
  }
  //console.log('buffer', buffer)

//==============================================================================================================================  

  const uploadImage = (description) => {
    console.log('Submitting files to ipfs')

    ipfs.add(buffer, (error, result) => {
      console.log('Ipfs', result)
      if(error) {
        console.log(error)
        return
      }
      // Now loading the image to the blockchain below
      setLoading(true)
      decentragram.methods.uploadImage(result[0].hash, description).send({ from: account }).on('transactionHash', (hash) => {
        setLoading( false )
      })

    })
  }

//==============================================================================================================================

  const tipImageOwner = (id, tipAmount) => {
      setLoading(true)
      decentragram.methods.tipImageOwner(id).send({ from: account, value: tipAmount }).on('transactionHash', (hash) => {
      setLoading(false)
    })
  }


//==============================================================================================================================

  
    return (
      <div>
        <Navbar account={account} />
        {loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            images={images}
            captureFile={captureFile}
            uploadImage={uploadImage}
            tipImageOwner={tipImageOwner}
            />
          }
        
      </div>
    );
  
}

export default App;



















// import Decentragram from '../abis/Decentragram.json'
// import React, { Component } from 'react';
// import Identicon from 'identicon.js';
// import Navbar from './Navbar'
// import Main from './Main'
// import Web3 from 'web3';
// import './App.css';
// //Declare IPFS
// const ipfsClient = require('ipfs-http-client')
// const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

// //console.log(images)

// class App extends Component {

//   constructor(props) {
//     super(props)
//     this.state = {
//       account: '',
//       decentragram: null,
//       images: [],
//       loading: true
//     }

  

    
//     this.uploadImage = this.uploadImage.bind(this)
//   //this.tipImageOwner = this.tipImageOwner.bind(this)
//     this.captureFile = this.captureFile.bind(this)
//   }



//   async componentWillMount() {
//     await this.loadWeb3()
//     await this.loadBlockchainData()
//   }
//   async loadWeb3() {
//     if (window.ethereum) {
//       window.web3 = new Web3(window.ethereum)
//       await window.ethereum.enable()
//     }
//     else if (window.web3) {
//       window.web3 = new Web3(window.web3.currentProvider)
//     }
//     else {
//       window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
//     }
//   }
//   async loadBlockchainData() {
//     const web3 = window.web3
//     // Load account
//     const accounts = await web3.eth.getAccounts()
//     this.setState({ account: accounts[0] })
//     // Network ID
//     const networkId = await web3.eth.net.getId()
//     const networkData = Decentragram.networks[networkId]
//     if(networkData) {
//       const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address)
//       this.setState({ decentragram })
//       const imagesCount = await decentragram.methods.imageCount().call()
//      // this.setState({ imagesCount })
//       // Load images
//       for (var i = 1; i <= imagesCount; i++) {
//         const image = await decentragram.methods.images(i).call()

//         console.log( image)

//         this.setState({
//           images: [...this.state.images, image]
//         })

//         console.log(this.state.images)
//       }
      
//       // Sort images. Show highest tipped images first
//       // this.setState({
//       //   images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
//       // })
//       this.setState({ loading: false})
//     } else {
//       window.alert('Decentragram contract not deployed to detected network.')
//     }
//   }
//   captureFile = event => {
//     event.preventDefault()
//     const file = event.target.files[0]
//     const reader = new window.FileReader()
//     reader.readAsArrayBuffer(file)
//     reader.onloadend = () => {
//       this.setState({ buffer: Buffer(reader.result) })
//       console.log('buffer', this.state.buffer)
//     }
//   }
//   uploadImage = description => {
//     console.log("Submitting file to ipfs...")
//     //adding file to the IPFS
//     ipfs.add(this.state.buffer, (error, result) => {
//       console.log('Ipfs result', result)
//       if(error) {
//         console.error(error)
//         return
//       }
//       this.setState({ loading: true })
//       this.state.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
//         this.setState({ loading: false })
//       })
//     })
//   }
//   // tipImageOwner(id, tipAmount) {
//   //   this.setState({ loading: true })
//   //   this.state.decentragram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
//   //     this.setState({ loading: false })
//   //   })
//   // }
//   render() {
    
//     return (
      
//       <div>
//         <Navbar account={this.state.account} />
//         { this.state.loading
//           ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
//           : <Main
//               images={this.state.images}
//               captureFile={this.captureFile}
//               uploadImage={this.uploadImage}
//               tipImageOwner={this.tipImageOwner}
//             />
//         }
//       </div>
//     );
//   }
// }
// export default App;