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

const profileData = [
  {
    "kind": 0,
    "content": "{\"name\":\"UsernameValue\",\"display_name\":\"NameValue\",\"picture\":\"https://nostr.build/i/nostr.build_b54c26563de133ac347df0c5bfd3a3f8d71b856d4f250f1d08a771b3dcbc914f.png\",\"about\":\"aboutValue\",\"lud16\":\"BitcoinImagined@getAlby.com\",\"nip05\":\"A@B.Com\"}",
    "tags": [],
    "created_at": 1679085495,
    "pubkey": "4dcae5c60ed258e687ecd4decade045740926054ff656582cf47d38416f28629",
    "id": "eeb87e46316e08950680be58d47acfe25d1fe5054c8b5186d84c7e7ec814b954",
    "sig": "98d7d636934d310eb9e52f0e5863ed3c0904b721cc63fc52bf2e8a740db4a4550b3f8025f2d787a8a90d101deaf778cd71c01a02124ad0d822e2dd00ee2d81ac",
    "meta": {
      "revision": 0,
      "created": 1679085495848,
      "version": 0
    }
  },
  {
    "id": "cc478e1d3e884733b7900321bcd65bd191eb6f2bdf026944f25f01d39d82bbf3",
    "kind": 3,
    "pubkey": "4dcae5c60ed258e687ecd4decade045740926054ff656582cf47d38416f28629",
    "created_at": 1678591913,
    "content": "",
    "tags": [
      [
        "p",
        "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"
      ],
      [
        "p",
        "e81ca829c9bd368cc584844078f570c105e59d9392d19ce71bb9f34c1ac633f3"
      ]
    ],
    "sig": "39b89f8192ba4bc3f16244871924d2b5992c88eb6aa525909e05507fd2da299c17b3e6e89e105aeeea83a4130abbfb1c08cfe3992ace29bc54d037b62b873376",
    "meta": {
      "revision": 0,
      "created": 1679085163032,
      "version": 0
    }
  }
]
