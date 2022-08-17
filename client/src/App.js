import './App.scss'
import Broadcast from './broadcast'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
    return (
        // <Broadcast />
        <Router>
            <Routes>
                <Route exact path='/' element={<Broadcast />} />
                <Route exact path='/live' element={<Broadcast />} />
                <Route exact path='/preview' element={<Broadcast preview />} />
            </Routes>
        </Router>
    )
}

export default App
