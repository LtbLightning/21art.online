import { call, put, takeEvery, all, fork } from 'redux-saga/effects'
import {
  getImagesSuccess,
  getImagesFailure,
  getImagesFetch,
  doNIP07Login,
  doNIP07LoginSuccess,
  doNIP07LoginFailure
} from './galleryState'
import image1 from './../../assets/img/e7120822.png';
import image2 from './../../assets/img/b9ab0855.jpg';
import image3 from './../../assets/img/b666675f.jpg';
import image4 from './../../assets/img/845374c9.jpg';
import image5 from './../../assets/img/e8bd3799.jpg';

function* workGetImagesFetch() {
  const gallery = yield call(() => fetch('https://mocki.io/v1/5c9e5d4e-8c23-4adb-85f9-9158c050e1d4'))
  const imagesArr = yield gallery.json()
  let refinedData = []
  imagesArr.forEach((image) => {
    let data = []
    image.tags.forEach((res) => {
      if (res.includes('21ArtMetaData')) {
        data.push(...res)
      }
    })
    refinedData.push({ data: data, originalObject: image })
  })

  let finalImages = []
  refinedData.forEach((res) => {
    const jsonString = res.data[1];
    const jsonStringUpdated = jsonString.slice(0, -1);
    const jsonObject = JSON.parse(jsonStringUpdated);

    let finalObject = {
      ...jsonObject,
      originalObject: res.originalObject
    }

    if (finalObject.id === '44d68b04') {
      finalImages.push({ fullscreenImage: image1, ...finalObject })
    }
    if (finalObject.id === 'e7120822') {
      finalImages.push({ fullscreenImage: image2, ...finalObject })
    }
    if (finalObject.id === 'b9ab0855') {
      finalImages.push({ fullscreenImage: image3, ...finalObject })
    }
    if (finalObject.id === 'b666675f') {
      finalImages.push({ fullscreenImage: image4, ...finalObject })
    }
    if (finalObject.id === 'e8bd3799') {
      finalImages.push({ fullscreenImage: image5, ...finalObject })
    }
  })

  finalImages.sort((a, b) => parseInt(a.sequenceId) - parseInt(b.sequenceId));
  yield put(getImagesSuccess(finalImages))
}

function* gallerySaga() {
  yield takeEvery(getImagesFetch.type, workGetImagesFetch)
}


function* NIP07LoginWorker() {
  try {
    const npub = yield (window.nostr.getPublicKey());
    yield put(doNIP07LoginSuccess(npub));
    // window.location.href = `/p/${nip19.npubEncode(npub)}`;
  } catch (e) {
    yield put(doNIP07LoginFailure(e));
  }

}
function* NIP07LoginSaga() {
  yield takeEvery(doNIP07Login.type, NIP07LoginWorker)
}

function* allSagas() {
  yield all([
    fork(gallerySaga),
    fork(NIP07LoginSaga)
  ]);
}

export default allSagas;
