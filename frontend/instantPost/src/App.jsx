import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import {Routes,Route} from 'react-router-dom'
import CreatePost from "./pages/CreatePost"
import Feed from "./pages/Feed"

function App() {
   

  return (
    <div>
      <Routes>
        <Route path="/" element={<CreatePost/>} ></Route>
        <Route path="/feed" element={<Feed/>}></Route>
      </Routes>
    </div>
  )
}

export default App
