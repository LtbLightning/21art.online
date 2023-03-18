import { call, put, takeEvery, select } from 'redux-saga/effects'
import { getImagesSuccess, getImagesFetch, getNextImagesFetch, getNextImagesSuccess, getPreviousImagesFetch, getPreviousImagesSuccess, getSortedDataSuccess } from './galleryState'
import axios from 'axios';
import { Buffer } from 'buffer';
// const gallerySelector = state => state.gallery;
// const imagesSelector = select(gallerySelector, gallery => gallery.images);

function* workGetImagesFetch() {
  // Hitting API once
  let refinedData = yield refineData('https://mocki.io/v1/32230ec5-a386-48f4-bc01-0d6199168633')
  let finalObject = []
  refinedData.forEach((res) => {
    const jsonString = res.data[1];
    const jsonStringUpdated = jsonString.slice(0, -1);
    const jsonObject = JSON.parse(jsonStringUpdated);

    finalObject.push({
      ...jsonObject,
      originalObject: res.originalObject
    })
  })

  //next button
  //previous = images
  //images = nextimages
  //nextimages = newAPi call

  //previous button
  // nextimages = images
  // images = previous
  // previousimages = new api call

  finalObject.sort((a, b) => parseInt(a.sequenceId) - parseInt(b.sequenceId));
  yield put(getSortedDataSuccess(finalObject))

  // Getting first 5 objects
  let finalImagesArr = finalObject.slice(0, 5)
  for (const [index, image] of finalImagesArr.entries()) {
    const fetchedFullImage = yield fetchImage(image, 'fullscreen')
    const fetchedThumbnailImage = yield fetchImage(image, 'thumbnail')
    finalImagesArr[index] = { fullscreenImage: fetchedFullImage, ...finalImagesArr[index] }
    finalImagesArr[index] = { thumbnailImage: fetchedThumbnailImage, ...finalImagesArr[index] }
  }
  yield put(getImagesSuccess(finalImagesArr))
}

function* workGetNextImagesFetch() {
  // const currentImages = yield select(state => state.gallery.images);
  // yield put(getPreviousImagesSuccess(currentImages))

  // // call the API to get the next set of images
  // // const images = yield call(getNextImages, galleryState.currentPage)
  // console.log("Bring next 5", currentImages)

  // API call will be only first time
  let refinedData = yield refineData('https://mocki.io/v1/4881ba1f-a0bd-41a5-a9aa-f1173350eb3e')

  let finalImages = []
  refinedData.forEach((res) => {
    const jsonString = res.data[1];
    const jsonStringUpdated = jsonString.slice(0, -1);
    const jsonObject = JSON.parse(jsonStringUpdated);

    let finalObject = {
      ...jsonObject,
      originalObject: res.originalObject
    }
  })

  finalImages.sort((a, b) => parseInt(a.sequenceId) - parseInt(b.sequenceId));
  yield put(getNextImagesSuccess(finalImages))
}

function* gallerySaga() {
  yield takeEvery(getImagesFetch.type, workGetImagesFetch)
  yield takeEvery(getNextImagesFetch.type, workGetNextImagesFetch)

}

function* fetchImage(image, imageSize) {
  let imageUrl = null

  if (imageSize === 'fullscreen') {
    imageUrl = `https://21artonline.s3.amazonaws.com/${image.id}_fullsize.png`;
  }
  else {
    imageUrl = `https://21artonline.s3.amazonaws.com/${image.id}_thumbnail.png`;
  }

  // Downloading images
  const response = yield call(
    axios.get,
    imageUrl,
    { responseType: 'arraybuffer' },
  );
  const imageBuffer = Buffer.from(response.data, 'binary').toString('base64');
  let imageData = `data:image/png;base64,${imageBuffer}`

  return imageData
}

function* refineData(url) {
  const gallery = yield call(() => fetch(url))
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
  return refinedData
}

export default gallerySaga