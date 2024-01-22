import './App.css'
import AudioPlayer from './components/AudioPlayer'
const App = () => {
  return <div className='container'>
    <AudioPlayer audioSrc="./music/soledad.mp3"/>
  </div>
}

export default App;