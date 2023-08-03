export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-6">
      <h1 className="text-5xl mb-2">Examples</h1>
      <p className="mb-4 text-red-500">
        NOTE: You need to have openmask installed in your browser in order to
        work
      </p>
      <section>
        <div>
          <label>Chain Id:</label>
          <input type="text" />
        </div>
        <div>
          <label>Safe Address:</label>
          <input type="text" />
        </div>
        <div>
          <label>Owner Address:</label>
          <input type="text" />
        </div>
        <button>is Owner?</button>
      </section>
      <section>
        <div>
          <label>Recipient:</label>
          <input type="text" />
        </div>
        <div>
          <label>Amount:</label>
          <input type="text" />
        </div>
        <button>Generate Payload</button>
      </section>
      <section>
        <div>
          <label>Order Cell BOC:</label>
          <input type="text" />
        </div>
        <button>Sign</button>
        <button>Create Transfer</button>
      </section>
      <section>
        <div>
          <label>Query Id:</label>
          <input type="text" />
        </div>
        <button>Get Status</button>
        <button>Get Balance</button>
      </section>
    </main>
  );
}
