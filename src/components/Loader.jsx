import '../styles/loader.css'
import loaderAnimation from '../assets/loaderAnimation.webm'
const Loader = () => {
    return (
        <div className='loader-container'>
           <video src={loaderAnimation} muted autoPlay loop></video> 
        </div>
    )
}

export default Loader;
