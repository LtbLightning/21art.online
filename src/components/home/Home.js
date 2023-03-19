import React, { useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Hammer from 'react-hammerjs'
import {
  getImagesFetch,
  getNextImagesFetch,
  getPreviousImagesFetch,
  updateImagesSet
} from '../../stores/galleryStore/galleryState'
import './home.css'
import {
  doNIP07Login,
  getEvents,
  doLikeEvent,
  publishArtEvents
} from '../../stores/nostrStore/nostrState'


let page = 2
const Home = () => {
  const dispatch = useDispatch()
  const {
    currentImageSet,
    nextImageSet,
    previousImageSet
  } = useSelector(state => state.gallery)

  const isMobile = useMediaQuery({ maxWidth: 430 })
  const { isLoggedIn, npub } = useSelector(state => state.nostr)

  const [imageArr, setImageArr] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});

  const imageClicked = (selectedObject) => {
    setSelectedImage(selectedObject)
    if (((selectedObject.sequencedId % 5) === 4) && (selectedObject.sequencedId > 10)) {
      dispatch(getNextImagesFetch(page))
    }
    if (((selectedObject.sequencedId % 5) === 2) && (selectedObject.sequencedId > 2)) {
      dispatch(getPreviousImagesFetch(page))
      // left arrow will be disabled when sequenced id == 1
    }
  }
  useEffect(() => {
    setImageArr(currentImageSet)
    if (currentImageSet?.length) {
      setSelectedImage(currentImageSet[2])
    }
  }, [currentImageSet])

  useEffect(() => {
    dispatch(getImagesFetch())
  }, [dispatch])

  useEffect(() => {
    if (isLoggedIn) { dispatch(getEvents()) }
  }, [isLoggedIn])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLikeIconClick = async () => {
    if (!isLoggedIn) {
      console.log("Not logged in")
      await dispatch(doNIP07Login('argument'))
      console.log("Should be logged in now ", { npub })
      // create like event for the image and broadcast
      // we should already know the current selected image index
    }
    else {
      console.log("Already logged in with ", { npub }, '\nAbout to like image')
      dispatch(doLikeEvent(selectedImage))
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
    if (index !== (imageArr?.length - 1)) {
      setSelectedImage(imageArr[index + 1])
    }
    if (index === (imageArr?.length - 2)) {
      console.log("Call API", imageArr?.length - 1)
    }
  }

  const getPreviousImages = () => {
    if (page > 2) {
      page = page - 1
      setImageArr(previousImageSet)
      dispatch(
        updateImagesSet({
          imagesSetType: 'nextImageSet',
          imagesSet: currentImageSet
        })
      )
      dispatch(
        updateImagesSet({
          imagesSetType: 'currentImageSet',
          imagesSet: previousImageSet
        })
      )
      dispatch(getPreviousImagesFetch(page))
    }
  }

  const getNextImages = () => {
    page = page + 1
    setImageArr(nextImageSet)
    dispatch(updateImagesSet({ imagesSetType: 'previousImageSet', imagesSet: currentImageSet }))
    dispatch(updateImagesSet({ imagesSetType: 'currentImageSet', imagesSet: nextImageSet }))
    dispatch(getNextImagesFetch(page))
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

  function handleMouseClick() {
    setShowMenu(!showMenu)
  }

  useEffect(() => {
    let timer;

    function handleMouseMove() {
      if(isMobile) {
        setShowMenu(!showMenu)
      }
      setIsMouseMoving(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsMouseMoving(false);
      }, isMobile ? 100 : 400);
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const imgRef = useRef(null);
  const carouselRef = useRef(null);

  function handleImageSwipe(event) {
    // Check swipe direction and distance
    const direction = event.direction;

    if (direction === 2) {
      handleNext()
    } else if (direction === 4) {
      handlePrevious()
    }
  }

  function handleCarouselSwipe(event) {
    // Check swipe direction and distance
    const direction = event.direction;

    if (direction === 2) {
      getNextImages()
    } else if (direction === 4) {
      getPreviousImages()
    }
  }

  return (
    <div>
      <Hammer onSwipe={handleImageSwipe}>
        <img ref={imgRef} className='image-container' src={selectedImage.fullscreenImage} alt='image1' onClick={handleMouseClick} />
      </Hammer>
      <div className='logo-container'>
        <img className='logo' src={require('./../../assets/img/logo.png')} alt='logo' />
      </div>
      <div className='arrows'>
        <div className='arrow-container-left' onClick={handlePrevious}>
          <img className='arrow-left' src={require('./../../assets/img/arrow-left.png')} alt='arrow-left' />
        </div>
        <div className={(showMenu || isMouseMoving) ? 'action-buttons-outer-container-hover' : 'action-buttons-outer-container'}>
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
      <div className={showMenu ? 'carousel-outer-container' : 'no-display'}>
        <div className='carousel-container'>
          <div className='carousel-arrow-container-left' onClick={getPreviousImages}>
            <img className='carousel-arrow-left' src={require('./../../assets/img/arrow-left.png')} alt='arrow-left' />
          </div>
          <Hammer onSwipe={handleCarouselSwipe}>
            <div ref={carouselRef} className='carousel-image-container'>
              {imageArr?.map((object, i) => {
                return ((!isMobile || (i !== 0 && i !== 4)) && <img className={`carousel-image ${selectedImage?.fullscreenImage === object?.fullscreenImage ? 'outer-stroke' : ''}`} src={object?.thumbnailImage} key={i} alt={`images-${i}`} onClick={() => imageClicked(object)} />)
              })}
            </div>
          </Hammer>
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
