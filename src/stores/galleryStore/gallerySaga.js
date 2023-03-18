import { call, put, takeEvery } from 'redux-saga/effects'
import { getImagesSuccess, getImagesFailure, getImagesFetch } from './galleryState'
import image1 from './../../assets/img/e7120822.png';
import image2 from './../../assets/img/b9ab0855.jpg';
import image3 from './../../assets/img/b666675f.jpg';
import image4 from './../../assets/img/845374c9.jpg';
import image5 from './../../assets/img/e8bd3799.jpg';

function* workGetImagesFetch() {
  const gallery = yield call(() => fetch('https://mocki.io/v1/d6d3c064-f78e-4ce3-854f-4bafcb6005e9'))
  const imagesArr = yield gallery.json()
  let refinedData = []
  imagesArr.forEach((image) => {
    let data = image.tags.filter((res) => {
      return res.includes('21ArtMetaData')
    })
    refinedData.push(...data)
  })
  let finalImages = []
  refinedData.forEach((res) => {
    const jsonString = res[1];
    const jsonStringUpdated = jsonString.slice(0, -1);
    const jsonObject = JSON.parse(jsonStringUpdated);
    let finalObject = {
      ...jsonObject,
      originalObject: res
    }
    // finalImages.push(jsonObject)
    if(finalObject.id === '44d68b04' ) {
      finalImages.push({ fullscreenImage: image1, ...finalObject })
    }
    if(finalObject.id === 'e7120822') {
      finalImages.push({ fullscreenImage: image2, ...finalObject })
    }
    if(finalObject.id === 'b9ab0855') {
      finalImages.push({ fullscreenImage: image3, ...finalObject })
    }
    if(finalObject.id === 'b666675f') {
      finalImages.push({ fullscreenImage: image4, ...finalObject })
    }
    if(finalObject.id === 'e8bd3799') {
      finalImages.push({ fullscreenImage: image5, ...finalObject})
    }
  })
  // console.log(finalImages)
  yield put(getImagesSuccess(finalImages))
}
const assignObject = (filteredObject, origionalObject, image) => {
  let obj = {
    ...filteredObject,
    origionalObject,

  }
  return 
}
function* gallerySaga() {
  yield takeEvery(getImagesFetch.type, workGetImagesFetch)
}

export default gallerySaga