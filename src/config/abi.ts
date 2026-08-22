export const INVOICE_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_fxBlitzScore", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "client", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "dueDate", "type": "uint256" },
      { "internalType": "uint256", "name": "factoringFee", "type": "uint256" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "createInvoice",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "invoiceId", "type": "uint256" }],
    "name": "payInvoice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "invoiceId", "type": "uint256" },
      { "internalType": "uint256", "name": "offerAmount", "type": "uint256" }
    ],
    "name": "requestFactoring",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "invoiceId", "type": "uint256" }],
    "name": "acceptFactoring",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "invoiceId", "type": "uint256" }],
    "name": "cancelFactoringRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "invoiceId", "type": "uint256" }],
    "name": "cancelInvoice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "invoiceId", "type": "uint256" }],
    "name": "getInvoice",
    "outputs": [{
      "components": [
        { "internalType": "uint256", "name": "id", "type": "uint256" },
        { "internalType": "address", "name": "issuer", "type": "address" },
        { "internalType": "address", "name": "client", "type": "address" },
        { "internalType": "uint256", "name": "amount", "type": "uint256" },
        { "internalType": "uint256", "name": "dueDate", "type": "uint256" },
        { "internalType": "uint256", "name": "factoringFee", "type": "uint256" },
        { "internalType": "string", "name": "metadataURI", "type": "string" },
        { "internalType": "uint8", "name": "status", "type": "uint8" },
        { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
      ],
      "internalType": "struct ArcInvoice.Invoice",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "invoiceId", "type": "uint256" }],
    "name": "getInvoiceStatus",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "invoiceId", "type": "uint256" }],
    "name": "getFactoringRequest",
    "outputs": [{
      "components": [
        { "internalType": "address", "name": "factor", "type": "address" },
        { "internalType": "uint256", "name": "offerAmount", "type": "uint256" },
        { "internalType": "uint8", "name": "status", "type": "uint8" }
      ],
      "internalType": "struct ArcInvoice.FactoringRequest",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "issuer", "type": "address" }],
    "name": "getIssuerInvoices",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "client", "type": "address" }],
    "name": "getClientInvoices",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "invoiceId", "type": "uint256" }],
    "name": "getRemainingTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeeBasisPoints",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeRecipient",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minGamesForFactoring",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fxBlitzScore",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "invoiceId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "issuer", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "client", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "InvoiceCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "invoiceId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "client", "type": "address" }
    ],
    "name": "InvoicePaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "invoiceId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "factor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "offerAmount", "type": "uint256" }
    ],
    "name": "FactoringRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "invoiceId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "factor", "type": "address" }
    ],
    "name": "FactoringAccepted",
    "type": "event"
  }
] as const;

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)"
] as const;

export const FXBLITZ_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "gamesPlayed",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
