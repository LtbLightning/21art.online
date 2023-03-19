import { call, put, takeEvery, all, fork, take } from 'redux-saga/effects'
import {
  doNIP07Login,
  doNIP07LoginSuccess,
  doNIP07LoginFailure,
  getEvents,
  getEventsSuccess,
  getEventsFailure,
  updateUserProfile,
  updateUserFollows,
  doLikeEvent,
  doLikeEventSuccess,
  doLikeEventFailure,
  publishArtEvent
} from './nostrState'
import { addUnsortedEvent } from '../galleryStore/galleryState';

import {
  relayInit,
  generatePrivateKey,
  getPublicKey,
  getEventHash,
  signEvent,
} from 'nostr-tools'

import { select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga'

// Defining a global relay for all sagas to use
let relay

function connectToRelay() {
  relay = relayInit('wss://relay.damus.io')
  relay.on('connect', () => {
  })
  relay.on('error', () => {
  })

  relay.connect()
}

function* nostrSaga() {
  yield takeEvery(doNIP07Login.type, NIP07LoginWorker)
  yield takeEvery(getEvents.type, getEventsWorker)
  yield takeEvery(doLikeEvent.type, doLikeEventWorker)
  yield takeEvery(publishArtEvent.type, publishArtEventWorker)
}

function imageListChannel() {
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel(emit => {
    const onHandler = (event) => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      emit(event)
    }
    const errorHandler = (errorEvent) => {
      console.log("errorHandler called", { errorEvent })
      // create an Error object and put it into the channel
      emit(new Error(errorEvent.reason))
    }

    // let's query for an event that exists
    let sub = relay.sub([
      {
        authors: ['4dcae5c60ed258e687ecd4decade045740926054ff656582cf47d38416f28629'],
        kinds: [1],
        limit: 33
      }
    ])
    sub.on('event', onHandler)
    sub.on('eose', errorHandler)
    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      sub.unsub()
    }
    return unsubscribe
  })
}


function userProfileChannel(npub) {
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel(emit => {
    const onHandler = (event) => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      emit(event)
    }
    const errorHandler = (errorEvent) => {
      console.log("errorHandler called", { errorEvent })
    }

    // let's query for an event that exists
    let sub = relay.sub([
      {
        authors: [npub],
        kinds: [0],
        limit: 1
      }
    ])
    sub.on('event', onHandler)
    sub.on('eose', errorHandler)
    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      sub.unsub()
    }
    return unsubscribe
  })
}

function* NIP07LoginWorker(x) {
  let npub = null
  try {
    npub = yield (window.nostr.getPublicKey());
    yield put(doNIP07LoginSuccess(npub));
  } catch (e) {
    alert("There was a problem login in with your nostr extension\nPlease make sure you have getAlby or Nostore extension installed")
    yield put(doNIP07LoginFailure(e));
  }
  const socketChannel = yield call(userProfileChannel, npub)
  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      const payload = yield take(socketChannel)
      const newUserInfo = JSON.parse(payload.content)
      newUserInfo.created_at = payload.created_at
      const userInfo = yield (select(state => state.nostr.userInfo))
      console.log("newUserInfo", newUserInfo, userInfo)
      if (!userInfo.created_at || userInfo?.created_at < newUserInfo?.created_at) {
        console.log("updating profile ...", newUserInfo, userInfo)
        yield put(updateUserProfile(newUserInfo))
      }
      if (payload.kind === 3) {
        yield put(updateUserFollows(JSON.parse(payload.content)))
      }
      // yield fork(pong, socket)
    } catch (err) {
      console.log('socket error:', err)
    }
  }


}

function* getEventsWorker() {
  if (!relay) { connectToRelay() }
  const socketChannel = yield call(imageListChannel)
  while (true) {
    try {
      // An error from socketChannel will cause the saga jump to the catch block
      const payload = yield take(socketChannel)
      yield put(addUnsortedEvent(payload))
      // yield fork(pong, socket)
    } catch (err) {
      console.log('socket error:', err)
    }
  }
}

function* doLikeEventWorker({ payload }) {
  const { userInfo, npub } = yield select(state => state.nostr)
  const originalEvent = payload.originalObject
  // create a event with kind 7
  const likeEvent = {
    kind: 7,
    content: '+',
    created_at: Math.floor(Date.now() / 1000),
    pubkey: npub,
    tags: []
  }
  const referredEvents = originalEvent.tags
    .filter((tag) => tag[0] === 'e')
    .reverse()
    .slice(0, 100);
  console.log("originalEvent.tags", originalEvent.tags)
  console.log("referredEvents", referredEvents)
  likeEvent.tags = referredEvents
  likeEvent.tags.push(['e', originalEvent.id])
  likeEvent.tags.push(['p', originalEvent.pubkey])
  likeEvent.id = getEventHash(likeEvent)
  console.log("likeEvent", likeEvent)
  const signedEvent = yield (window.nostr.signEvent(likeEvent))
  const pub = yield (relay.publish(signedEvent))
  pub.on('ok', () => {
    console.log(`${relay.url} has accepted our event`)
  })
  pub.on('failed', reason => {
    console.log(`failed to publish to ${relay.url}: ${reason}`)
  })
}

// This will only be used internally for publishing new art events
function* publishArtEventWorker({ payload }) {
  const { id, sequenceId } = { id: '21artonlineimageaabb8', sequenceId: '8' }
  const pubKey = 'xpub'
  const privKey = 'xpriv'
  const artId = id
  const artSequenceId = sequenceId
  const artEvent = {
    "kind": 1,
    "content": `Visit https://21Art.Online for more!\n\nhttps://21artonline.s3.amazonaws.com/${artId}_thumbnail.png\n`,
    "tags": [
      ["t", "bitcoin", "21artonline", "art", "21art", "21art.online"],
      ["21art.online", JSON.stringify({
        "id": artId,
        "sequenceId": artSequenceId,
      })],
    ],
    "created_at": Math.floor(Date.now() / 1000),
    "pubkey": pubKey,
  }
  artEvent.id = getEventHash(artEvent)
  artEvent.sig = signEvent(artEvent, privKey)
  console.log("artEvent", artEvent)
  const pub = yield (relay.publish(artEvent))
  pub.on('ok', () => {
    console.log(`${relay.url} has accepted our event`)
  })
  pub.on('failed', reason => {
    console.log(`failed to publish to ${relay.url}: ${reason}`)
  })
}

export default nostrSaga
