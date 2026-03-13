import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Load the existing app
    window.location.href = '/public/index.html'
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      Loading Life Tracker...
    </div>
  )
}

export default App
