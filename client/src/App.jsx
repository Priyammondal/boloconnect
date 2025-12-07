import { Routes, Route } from 'react-router-dom'
import Lobby from './pages/Lobby'
import 'bootstrap/dist/css/bootstrap.min.css';
import Room from './pages/Room';

const App = () => {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Lobby />} />
        <Route path='/room/:roomId' element={<Room />} />
      </Routes>
    </div>
  )
}

export default App