import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from "./pages/Home"
import Start from './components/Start'

function App() {

  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route exact path="/login"  element={ <Login/>} />
            <Route exact path="/register" element={<Register />} />
          <Route exact path="/chats" element={<Home />} />
          <Route exact path="/" element={<Start />} />
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App
