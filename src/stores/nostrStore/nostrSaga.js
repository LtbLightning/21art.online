import { call, put, takeEvery, all, fork } from 'redux-saga/effects'
import {
  doNIP07Login,
  doNIP07LoginSuccess,
  doNIP07LoginFailure,
  getEvents,
  getEventsSuccess,
  getEventsFailure,
  doLikeEvent,
  doLikeEventSuccess,
  doLikeEventFailure,
  publishArtEvents
} from './nostrState'

import {
  relayInit,
  generatePrivateKey,
  getPublicKey,
  getEventHash,
  signEvent,
} from 'nostr-tools'

import { select } from 'redux-saga/effects';

function* nostrSaga() {
  yield takeEvery(doNIP07Login.type, NIP07LoginWorker)
  yield takeEvery(getEvents.type, getEventsWorker)
  yield takeEvery(doLikeEvent.type, doLikeEventWorker)
  yield takeEvery(publishArtEvents.type, publishArtEventsWorker)
}

function* NIP07LoginWorker(x) {
  console.log("NIP07LoginWorker called", { x })
  try {
    const npub = yield (window.nostr.getPublicKey());
    console.log("npub", npub)
    yield put(doNIP07LoginSuccess(npub));
    // window.location.href = `/p/${nip19.npubEncode(npub)}`;
  } catch (e) {
    alert("There was a problem login in with your nostr extension\nPlease make sure you have getAlby or Nostore extension installed")
    yield put(doNIP07LoginFailure(e));
  }
}
// Events lists

function* getEventsWorker() {
  console.log("getEventsWorker called")
  const relay = relayInit('wss://relay.damus.io')
  relay.on('connect', () => {
    console.log(`connected to ${relay.url}`)
  })
  relay.on('error', () => {
    console.log(`failed to connect to ${relay.url}`)
  })

  yield (relay.connect())
  yield put(getEventsSuccess(relay))
  // let's query for an event that exists
  let sub = relay.sub([
    {
      authors: ['031f3c690619df040f2de7cdbf2342de845406b38167c6835b4980fcb4fe4426'],
      kinds: [0],
      limit: 33
    }
  ])
  sub.on('event', event => {
    console.log('we got the event we wanted:', event)
  })
  sub.on('eose', () => {
    sub.unsub()
  })
}

function* doLikeEventWorker({ payload }) {
  const { npub, relay, mockData } = yield select(state => state.nostr)
  console.log("doLikeEventWorker called", { npub, relay, mockData })
  const originalEvent = mockData.originalEvent// payload.originalEvent
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
    .slice(0, 30);
  console.log("tags", originalEvent.tags)
  console.log("referredEvents", referredEvents)
  likeEvent.tags.push(['e', originalEvent.id])
  likeEvent.tags.push(['p', originalEvent.pubkey])
  likeEvent.id = getEventHash(likeEvent)
  const signedEvent = yield (window.nostr.signEvent(likeEvent))
  console.log("signedEvent", signedEvent)
  const pub = yield (relay.publish(signedEvent))
  pub.on('ok', () => {
    console.log(`${relay.url} has accepted our event`)
  })
  pub.on('failed', reason => {
    console.log(`failed to publish to ${relay.url}: ${reason}`)
  })
}

// This will only be used internally for publishing new art events
function* publishArtEventsWorker({ payload }) {
  const { npub, relay } = yield select(state => state.nostr)
  console.log("publishArtEventsWorker called", { npub, relay, payload })
  const { id, sequenceId } = payload
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

const a = {
  "banner": "https://void.cat/d/N2Hai6NB34hXb2gF9rYshn",
  "website": "https://twitter.com/BitcoinImagined",
  "nip05": "BitcoinImagined@nostrplebs.com",
  "picture": "https://nostr.build/i/5420.png",
  "lud16": "bitcoinimagined@getalby.com",
  "display_name": "Bitcoin Imagined",
  "about": "Follow for Visually Stunning Bitcoin and Nostr Art\n\nhttps://twitter.com/BitcoinImagined",
  "name": "BitcoinImagined"
}