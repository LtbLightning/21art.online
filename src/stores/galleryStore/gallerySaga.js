import { call, put, takeEvery, select } from 'redux-saga/effects'
import { getImagesSuccess, getImagesFetch, getNextImagesFetch, getNextImagesSuccess, getPreviousImagesFetch, getPreviousImagesSuccess, getSortedDataSuccess } from './galleryState'
import axios from 'axios'
import { Buffer } from 'buffer'

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
  yield workGetNextImagesFetch({ payload: 2 })
}

function* workGetPreviousImagesFetch(page) {
  const sortedData = yield select(state => state.gallery.sortedData);
  let pageNo = page.payload - 3
  const startImage = pageNo * 5
  const endImage = (page.payload - 2) * 5

  // Getting previous 5 objects
  let finalImagesArr = sortedData.slice(startImage, endImage)
  for (const [index, image] of finalImagesArr.entries()) {
    const fetchedFullImage = yield fetchImage(image, 'fullscreen')
    const fetchedThumbnailImage = yield fetchImage(image, 'thumbnail')
    finalImagesArr[index] = { fullscreenImage: fetchedFullImage, ...finalImagesArr[index] }
    finalImagesArr[index] = { thumbnailImage: fetchedThumbnailImage, ...finalImagesArr[index] }
  }

  yield put(getPreviousImagesSuccess(finalImagesArr))
}

function* workGetNextImagesFetch(page) {
  const sortedData = yield select(state => state.gallery.sortedData);
  const pageNo = page.payload - 1
  const startImage = pageNo * 5
  const endImage = page.payload * 5

  let finalImagesArr = sortedData.slice(startImage, endImage)
  for (const [index, image] of finalImagesArr.entries()) {
    const fetchedFullImage = yield fetchImage(image, 'fullscreen')
    const fetchedThumbnailImage = yield fetchImage(image, 'thumbnail')
    finalImagesArr[index] = { fullscreenImage: fetchedFullImage, ...finalImagesArr[index] }
    finalImagesArr[index] = { thumbnailImage: fetchedThumbnailImage, ...finalImagesArr[index] }
  }

  yield put(getNextImagesSuccess(finalImagesArr))
}

function* gallerySaga() {
  yield takeEvery(getImagesFetch.type, workGetImagesFetch)
  yield takeEvery(getNextImagesFetch.type, workGetNextImagesFetch)
  yield takeEvery(getPreviousImagesFetch.type, workGetPreviousImagesFetch)

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