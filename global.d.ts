interface EthereumProvider {
  isMetaMask?: boolean
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on?: (...args: any[]) => void
}

interface Window {
  ethereum?: EthereumProvider
}
