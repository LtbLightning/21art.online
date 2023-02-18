import React from 'react'
import { useMediaQuery } from 'react-responsive'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import './home.css'

const Home = () => {
  const isMobile = useMediaQuery({ maxWidth: 430 })
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
            {!isMobile && <img className='carousel-image' src={require('./../../assets/img/image1.jpg')} alt='image1' />}
            <img className='carousel-image' src={require('./../../assets/img/image2.jpg')} alt='image1' />
            <img className='carousel-image outer-stroke' src={require('./../../assets/img/image6.png')} alt='image1' />
            <img className='carousel-image' src={require('./../../assets/img/image3.jpg')} alt='image1' />
            {!isMobile && <img className='carousel-image' src={require('./../../assets/img/image4.jpg')} alt='image1' />}
          </div>
          <div className='carousel-arrow-container-right'>
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
