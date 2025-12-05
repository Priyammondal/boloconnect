import { Routes, Route } from 'react-router-dom'
import Lobby from './pages/Lobby'
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Lobby />} />
      </Routes>
    </div>
  )
}

export default App