export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div>
        <h1 className="text-2xl font-bold">Crypto Design Assets</h1>
        <p>Crypto logos, Chains logos, Tokens logos</p>
        <ul>
          <li>Self-hosted - FREE</li>
          <li>Hosted on IPFS - FREE</li>
          <li>Centralized Hosting - SUBSCRIBE</li>
        </ul>

        <button>Submit asset</button>
      </div>
      <div>
        <input placeholder="search" />
        gallery
      </div>
    </div>
  );
}
