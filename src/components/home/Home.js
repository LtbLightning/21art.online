import React from 'react'
import { useMediaQuery } from 'react-responsive'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';

import image6 from './../../assets/img/image7.jpg';
import image7 from './../../assets/img/image8.jpg';
import image8 from './../../assets/img/image9.jpg';
import image9 from './../../assets/img/image10.jpg';
import image10 from './../../assets/img/image11.jpg';
import './home.css'
import { useSelector, useDispatch } from 'react-redux';
import { getImagesFetch, doNIP07Login } from '../../stores/galleryStore/galleryState';

const Home = () => {
  const dispatch = useDispatch()
  const apiResult = useSelector(state => state.gallery.images)
  const isLoggedIn = useSelector(state => state.gallery.isLoggedIn)
  const npub = useSelector(state => state.gallery.npub)

  const isMobile = useMediaQuery({ maxWidth: 430 })
  const [imageArr, setImageArr] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(imageArr[2]);

  useEffect(() => {
    let images = []
    apiResult.forEach((res) => {
      images.push(res.fullscreenImage)
    })
    setImageArr(images)
    setSelectedImage(images[2])
  }, [apiResult])

  useEffect(() => {
    dispatch(getImagesFetch())
  }, [dispatch])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLikeIconClick = async () => {
    console.log("handleLikeIconClick called")

    if (!isLoggedIn) {
      console.log("Not logged in")
      await dispatch(doNIP07Login())
      console.log("Should be logged in now ", { npub })
      // create like event for the image and broadcast
      // we should already know the current selected image index
    }
    else {
      console.log("Already logged in ", { npub })
      // create like event for the image and broadcast
      // we should already know the current selected image index
    }
  }


  const handlePrevious = () => {
    let index = imageArr.indexOf(selectedImage)
    if (index !== 0) {
      setSelectedImage(imageArr[index - 1])
    }
  }

  const handleNext = () => {
    let index = imageArr.indexOf(selectedImage)
    if (index !== (imageArr.length - 1)) {
      setSelectedImage(imageArr[index + 1])
    }
    if (index === (imageArr.length - 2)) {
      console.log("Call API", imageArr.length - 1)
    }
  }

  const getPreviousImages = () => {
    let newImages = [image6, image7, image8, image9, image10]

    if (!newImages.includes(selectedImage)) {
      setImageArr([...newImages])
    }
    else {
      // imageArr = [image1, image2, image3, image4, image5]
    }
    setSelectedImage(imageArr[2])
  }

  const getNextImages = () => {
    let newImages = [image6, image7, image8, image9, image10]
    if (!newImages.includes(selectedImage)) {
      setImageArr([...newImages])
    }
    else {
      // imageArr = [image1, image2, image3, image4, image5]
    }
    setSelectedImage(imageArr[2])
  }

  const useKeyPress = function (targetKey) {
    useEffect(() => {
      const keyHandler = ({ key }) => {
        if (key === targetKey) {
          if (key === 'ArrowUp') {
            handleNext()
          }
          else if (key === 'ArrowDown') {
            handlePrevious()
          }
          else if (key === 'ArrowLeft') {
            handlePrevious()
          }
          else if (key === 'ArrowRight') {
            handleNext()
          }
        }
      };

      window.addEventListener("keyup", keyHandler)

      return () => {
        window.removeEventListener("keyup", keyHandler)
      };
    })

    return
  };

  useKeyPress("ArrowUp");
  useKeyPress("ArrowDown");
  useKeyPress("ArrowLeft");
  useKeyPress("ArrowRight");

  return (
    <div>
      <img className='image-container' src={selectedImage} alt='image1' />
      <div className='logo-container'>
        <img className='logo' src={require('./../../assets/img/logo.png')} alt='logo' />
      </div>
      <div className='arrows'>
        <div className='arrow-container-left' onClick={handlePrevious}>
          <img className='arrow-left' src={require('./../../assets/img/arrow-left.png')} alt='arrow-left' />
        </div>
        <div className='action-buttons-outer-container'>
          <div className='action-button-container' onClick={handleClickOpen}>
            <img className='flash-icon' src={require('./../../assets/img/flash-icon.png')} alt='flash-icon' />
          </div>
          <div className='action-button-container'>
            <img className='download-icon' src={require('./../../assets/img/download-icon.png')} alt='flash-icon' />
          </div>
          <div className='action-button-container'>
            <img className='fullscreen-icon' src={require('./../../assets/img/fullscreen-icon.png')} alt='flash-icon' />
          </div>
          <div className='action-button-container'>
            <img className='like-icon' src={require('./../../assets/img/like-icon.png')} alt='flash-icon' onClick={handleLikeIconClick} />
          </div>
        </div>
        <div className='arrow-container-right' onClick={handleNext}>
          <img className='arrow-right' src={require('./../../assets/img/arrow-right.png')} alt='arrow-right' />
        </div>
      </div>
      <div className='carousel-outer-container'>
        <div className='carousel-container'>
          <div className='carousel-arrow-container-left' onClick={getPreviousImages}>
            <img className='carousel-arrow-left' src={require('./../../assets/img/arrow-left.png')} alt='arrow-left' />
          </div>
          <div className='carousel-image-container'>
            {imageArr.map((object, i) => {
              return ((!isMobile || (i !== 0 && i !== 4)) && <img className={`carousel-image ${selectedImage === object ? 'outer-stroke' : ''}`} src={object} key={i} alt={`images-${i}`} onClick={() => setSelectedImage(object)} />)
            })}
          </div>
          <div className='carousel-arrow-container-right' onClick={getNextImages}>
            <img className='carousel-arrow-right' src={require('./../../assets/img/arrow-right.png')} alt='arrow-left' />
          </div>
        </div>
      </div>
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <div className='qrcode-outer-container'>
            <div className='qrcode-action-button'>
              <div className='screen-button-container'>
                <img className='screen-icon' src={require('./../../assets/img/screen-icon.png')} alt='screen-icon' />
              </div>
              <IconButton
                aria-label="close"
                onClick={handleClose}
                className="close-button"
                sx={{
                  alignItems: 'start',
                  color: 'white'
                }}
              >
                <CloseIcon className="close-button" />
              </IconButton>
            </div>
            <div className='qr-code'>
              <img className='qr-code-icon' src={require('./../../assets/img/qr-code.png')} alt='screen-icon' />
            </div>
            <div className='qrcode-bottom-button'>
              <Button onClick={handleClose} className="button" variant="contained">
                Maybe Later
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

export default Home
