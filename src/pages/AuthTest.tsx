export default function AuthTest() {
  console.log('AuthTest component rendering...');
  
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Auth Test Page</h1>
        <p>If you can see this, the basic component is working.</p>
        <button 
          onClick={() => console.log('Button clicked!')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Button
        </button>
      </div>
    </div>
  );
}