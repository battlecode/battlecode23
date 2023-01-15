import React from 'react'
import ReactDom from 'react-dom/client'
import { MainPage } from './components/main-page'

import '../style.css'

const elem = document.getElementById('root')
const root = ReactDom.createRoot(elem!)
root.render(<MainPage />)