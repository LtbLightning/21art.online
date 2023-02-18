import React from 'react'
import { useMediaQuery } from 'react-responsive'
import './home.css'

const Home = () => {
const isMobile = useMediaQuery({ maxWidth: 430 })
  return (
    <div>
      <img className='image-container' src={require('./../../assets/img/image6.png')} alt='image1' />
      <div className='logo-container'>
        <img className='logo' src={require('./../../assets/img/logo.png')} alt='logo' />
      </div>
      <div className='arrows'>
        <div className='arrow-container-left'>
          <img className='arrow-left' src={require('./../../assets/img/arrow-left.png')} alt='arrow-left' />
        </div>
        <div className='action-buttons-outer-container'>
          <div className='action-button-container'>
            <img className='flash-icon' src={require('./../../assets/img/flash-icon.png')} alt='flash-icon' />
          </div>
          <div className='action-button-container'>
            <img className='download-icon' src={require('./../../assets/img/download-icon.png')} alt='flash-icon' />
          </div>
          <div className='action-button-container'>
            <img className='fullscreen-icon' src={require('./../../assets/img/fullscreen-icon.png')} alt='flash-icon' />
          </div>
          <div className='action-button-container'>
            <img className='like-icon' src={require('./../../assets/img/like-icon.png')} alt='flash-icon' />
          </div>
        </div>
        <div className='arrow-container-right'>
          <img className='arrow-right' src={require('./../../assets/img/arrow-right.png')} alt='arrow-right' />
        </div>
      </div>
      <div className='carousel-outer-container'>
        <div className='carousel-container'>
          <div className='carousel-arrow-container-left'>
            <img className='carousel-arrow-left' src={require('./../../assets/img/arrow-left.png')} alt='arrow-left' />
          </div>
          <div className='carousel-image-container'>
            { !isMobile && <img className='carousel-image' src={require('./../../assets/img/image1.jpg')} alt='image1' /> }
            <img className='carousel-image' src={require('./../../assets/img/image2.jpg')} alt='image1' />
            <img className='carousel-image outer-stroke' src={require('./../../assets/img/image6.png')} alt='image1' />
            <img className='carousel-image' src={require('./../../assets/img/image3.jpg')} alt='image1' />
            { !isMobile && <img className='carousel-image' src={require('./../../assets/img/image4.jpg')} alt='image1' /> }
          </div>
          <div className='carousel-arrow-container-right'>
            <img className='carousel-arrow-right' src={require('./../../assets/img/arrow-right.png')} alt='arrow-left' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
