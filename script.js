const contractAddress = '0x54673e24D608E5135Eb0F6628E2179a72f1aF6aD';
const abi = [
    {"inputs":[{"internalType":"contract IERC20","name":"_usdt","type":"address"},{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"category","type":"uint256"},{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"ticketNumber","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"prizeAmount","type":"uint256"}],"name":"LotteryWinner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"uint256","name":"category","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"name":"TicketPurchased","type":"event"},{"inputs":[{"internalType":"uint256","name":"category","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"}],"name":"buyTicket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserTickets","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"ticketCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tickets","outputs":[{"internalType":"uint256","name":"category","type":"uint256"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"ticketNumber","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdt","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];
const usdtAddress = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'; // USDT contract address
const usdtAbi = [
    {
    "inputs":[{"internalType":"address","name":"_logic","type":"address"},{"internalType":"address","name":"admin_","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"admin_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"implementation_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}
    }
];

const web3 = new Web3(window.ethereum || 'https://arb1.arbitrum.io/rpc/'); // Use window.ethereum for the provider
let contract;
let usdtContract; // Define USDT contract variable
let userAddress;

// Initialize the contract and wallet connection
async function init() {
    try {
        if (window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request access to accounts
            const accounts = await web3.eth.getAccounts(); // Get user's accounts
            userAddress = accounts[0];
            contract = new web3.eth.Contract(abi, contractAddress);
            usdtContract = new web3.eth.Contract(usdtAbi, usdtAddress); // Initialize USDT contract instance
            document.getElementById('wallet-address').innerText = userAddress;

            const networkId = await web3.eth.net.getId();
            if (networkId !== 42161) { // Arbitrum One network ID
                document.getElementById('network-info').innerText = 'Please switch to the Arbitrum One network.';
            } else {
                document.getElementById('network-name').innerText = 'Arbitrum One';
            }

            // Listen for contract events
            listenForEvents();

        } else {
            alert("No Ethereum provider detected. Please install MetaMask.");
        }
    } catch (error) {
        handleError(error);
    }
}

// Listen for contract events
function listenForEvents() {
    contract.events.TicketPurchased({}, (error, event) => {
        if (!error) {
            displayEventAlert(`Ticket purchased! Category: ${event.returnValues.category}, Buyer: ${event.returnValues.buyer}`);
        } else {
            console.error('Error in TicketPurchased event:', error); // Added better error logging
        }
    });

    contract.events.LotteryWinner({}, (error, event) => {
        if (!error) {
            displayEventAlert(`We have a winner! Category: ${event.returnValues.category}, Winner: ${event.returnValues.winner}, Prize: ${web3.utils.fromWei(event.returnValues.prizeAmount, 'ether')} USDT`);
        } else {
            console.error('Error in LotteryWinner event:', error); // Added better error logging
        }
    });
}

// Display event alerts in the alert list
function displayEventAlert(message) {
    const alertList = document.getElementById('alert-list');
    const newAlert = document.createElement('li');
    newAlert.innerText = message;
    alertList.appendChild(newAlert);
}

// Handle errors
function handleError(error) {
    let errorMsg = "Unknown error.";
    if (error.message.includes("insufficient funds")) {
        errorMsg = "Insufficient funds. Please ensure you have enough USDT.";
    } else if (error.message.includes("user denied transaction")) {
        errorMsg = "Transaction was denied by the user.";
    } else {
        errorMsg = error.message;
    }
    alert(errorMsg);
}

// Initialize the app on page load
window.addEventListener('load', () => {
    init();
});
