import React from 'react'
import './dialog-modal.css'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

const DialogModal = (props) => {
  function handleClose() {
    props.closeDialogModal(false)
  }

  return (
    <div>
      <div className={(props.type === 'error') ? 'error-height dialog-modal-container' : 'info-height dialog-modal-container'}>
        <div className='close-button-container'>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className="dialog-close-btn"
            sx={{
              alignItems: 'center',
            }}
          >
            <CloseIcon className="dialog-close-btn"/>
          </IconButton>
        </div>
        <div className='center-align-items'>
          <img className={(props.type === 'error') ? 'error-icon' : 'info-icon'} src={(props.type === 'error') ? require('./../../../assets/img/error.png') : require('./../../../assets/img/info.png')} />
          {props.type === 'error' && <div className='error-title'>Oh Snap!</div>}
          <div className='dialog-paragraph'>{(props.type === 'error') ? 'An error has occured while creating an error report' : '21Art uses Nostr browswer extensions to login' }</div>
          <div>
            <button className='gradient-button' onClick={handleClose}>Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DialogModal