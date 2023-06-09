import React, { useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Hammer from 'hammerjs'
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
  publishArtEvent
} from '../../stores/nostrStore/nostrState';
import DialogModal from '../common/dialogModal/DialogModal'

let page = 2
const imageSetSize = 5
const Home = () => {
  const dispatch = useDispatch()
  const {
    currentImageSet,
    nextImageSet,
    previousImageSet,
    eventListRetrieved,
    totalImages
  } = useSelector(state => state.gallery)

  const isMobile = useMediaQuery({ maxWidth: 430 })
  const { npub, isLoggedIn, userInfo } = useSelector(state => state.nostr)

  const [imageArr, setImageArr] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [open, setOpen] = useState(false);
  const [showDialogModal, setShowDialogModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [likeClicked, setLikeClicked] = useState(false);
  const [showActual, setShowActual] = useState(true);

  const handleActualSize = () => {
    setShowActual(!showActual)
  }
  const imageClicked = (i) => {

    setSelectedImageIndex(i)
    if (((imageArr[i].sequencedId % 5) === 4) && (imageArr[i].sequencedId > 10)) {
      dispatch(getNextImagesFetch(page))
    }
    if (((imageArr[i].sequencedId % 5) === 2) && (imageArr[i].sequencedId > 2)) {
      dispatch(getPreviousImagesFetch(page))
      // left arrow will be disabled when sequenced id == 1
    }
  }

  useEffect(() => {
    setImageArr(currentImageSet)
    // if (currentImageSet?.length) {
    //   setSelectedImage(currentImageSet[0])
    // }
  }, [currentImageSet])

  useEffect(() => {
    dispatch(getEvents())
  }, [dispatch])

  useEffect(() => {
    if (eventListRetrieved) { dispatch(getImagesFetch()) }
  }, [eventListRetrieved])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogin = async () => {
    if (!isLoggedIn) { await dispatch(doNIP07Login()) }
    // await dispatch(publishArtEvent())
  }
  const handleDialogOpen = () => {
    setShowDialogModal(true)
  };

  const handleLikeIconClick = async () => {
    setLikeClicked(true)
    if (!isLoggedIn) {
      console.log("Not logged in")
      await dispatch(doNIP07Login())
      console.log("Should be logged in now ", { npub })
      // create like event for the image and broadcast
      // we should already know the current selected image index
      // await dispatch(doLikeEvent(imageArr[selectedImageIndex]))
    }
    else {
      console.log("Already logged in with ", { npub }, '\nAbout to like image')
      dispatch(doLikeEvent(imageArr[selectedImageIndex]))
    }
  }

  const handlePrevious = async () => {
    setLikeClicked(false)
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
    else if (selectedImageIndex === 0 && page !== 2) {
      await getPreviousImages()
      setSelectedImageIndex(imageSetSize - 1)
    }
    else if (selectedImageIndex === 0 && page === 2) {
      setSelectedImageIndex(0)
    }
  }

  const handleNext = async () => {
    setLikeClicked(false)
    if (selectedImageIndex < imageSetSize - 1 && page <= Math.ceil(totalImages / imageSetSize)) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
    else if (selectedImageIndex === imageSetSize - 1 && page <= Math.ceil(totalImages / imageSetSize)) {
      await getNextImages()
      setSelectedImageIndex(0)
    }
    else if (selectedImageIndex < imageSetSize - 1 && page > Math.ceil(totalImages / imageSetSize)) {
      if (selectedImageIndex + 1) {
        setSelectedImageIndex(
          selectedImageIndex + 1 > totalImages % imageSetSize - 1
            ? totalImages % imageSetSize - 1
            : selectedImageIndex + 1
        )
      }
    }

    if (selectedImageIndex === imageSetSize - 2) {
      console.log("Call API", selectedImageIndex)
    }
  }

  const getPreviousImages = async () => {
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

  const closeDialogModal = () => {
    setShowDialogModal(false)
  }

  const getNextImages = async () => {
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
      if (isMobile) {
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

  useEffect(() => {
    const bgImageRef = new Hammer(imgRef.current);
    const imgCarouselRef = new Hammer(carouselRef.current);

    // enable all directions
    bgImageRef.get('swipe').set({
      direction: Hammer.DIRECTION_ALL,
      threshold: 1,
      velocity: 0.1,
    });
    imgCarouselRef.get('swipe').set({
      direction: Hammer.DIRECTION_ALL,
      threshold: 1,
      velocity: 0.1,
    });

    // listen to events...
    bgImageRef.on("swipeup swipedown swipeleft swiperight", function (ev) {
      if (ev.type === 'swipeup' || ev.type === 'swipeleft') {
        handleNext()
      }
      if (ev.type === 'swipedown' || ev.type === 'swiperight') {
        handlePrevious()
      }
    });

    imgCarouselRef.on("swipeleft swiperight", function (ev) {
      if (ev.type === 'swiperight') {
        getPreviousImages()
      }
      if (ev.type === 'swipeleft') {
        getNextImages()
      }
    });

    // cleanup function
    return () => {
      bgImageRef.off("swipeup swipedown swipeleft swiperight");
      imgCarouselRef.off("swipeleft swiperight");
    };
  });

  return (

    <div>
      <img ref={imgRef} className={showActual ? 'image-container' : 'image-container-actual'} src={imageArr[selectedImageIndex]?.fullscreenImage || require('./../../assets/img/initialBackground.png')} alt='image1' onClick={handleMouseClick} />
      <div className='logo-container'>
        <img className='logo' src={require('./../../assets/img/logo.png')} alt='logo' />
      </div>
      <div className='login-container' onClick={handleLogin}>
        <img className='login-avatar' src={isLoggedIn ? userInfo?.picture : require('./../../assets/img/login-avatar.png')} alt='logo' />
        <div className='login-text'>{isLoggedIn ? userInfo?.name : 'Login'}</div>
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
            <img className='fullscreen-icon' src={require('./../../assets/img/fullscreen-icon.png')} alt='flash-icon' onClick={handleActualSize} />
          </div>
          <div className='action-button-container'>
            <img className='like-icon' src={likeClicked ? require('./../../assets/img/like-icon-clicked.png') : require('./../../assets/img/like-icon.png')} alt='flash-icon' onClick={handleLikeIconClick} />
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
          <div ref={carouselRef} className='carousel-image-container'>
            {imageArr?.map((object, i) => {
              return ((!isMobile || (i !== 0 && i !== 4)) && <img className={`carousel-image ${imageArr[selectedImageIndex]?.fullscreenImage === object?.fullscreenImage ? 'outer-stroke' : ''}`} src={object?.thumbnailImage} key={i} alt={`images-${i}`} onClick={() => imageClicked(i)} />)
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
                <img className='screen-icon' src={require('./../../assets/img/screen-icon.png')} alt='copy to clipboard' onClick={() => { navigator.clipboard.writeText('lnurl1dp68gurn8ghj7em9w3skccne9e3k7mf09emk2mrv944kummhdchkcmn4wfk8qtmzd96xxmmfde5k6ct8d9hx2eqqx7tna') }} />
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
              <img className='qr-code-icon' src={require('./../../assets/img/21art_qrcode.png')} alt='screen-icon' />
            </div>
            <div className='qrcode-bottom-button'>
              <Button onClick={handleClose} className="button" variant="contained">
                Maybe Later
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
      <Dialog
        open={showDialogModal}
        onClose={closeDialogModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogModal type='error' closeDialogModal={closeDialogModal} />
      </Dialog>
    </div>
  )
}

export default Home
