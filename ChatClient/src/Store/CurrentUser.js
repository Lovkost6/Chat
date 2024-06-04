import { createEvent, createStore,createEffect } from 'effector';

export const setCurrentUser = createEvent();
const unwatchCookiesSet = setCurrentUser.watch((payload) => localStorage.setItem("user",JSON.stringify(payload)))

export const resetCurrentUser = createEvent()
const unwatchCookiesRemove = resetCurrentUser.watch(() => localStorage.removeItem("user"))

const readLocalStorageUser = createEffect(
    () => {
    const user = localStorage.getItem("user")
    if (user == null){
        return null
    } else{
        return JSON.parse(user)
    }
})
export const $currentUser = createStore(null)
    .on(readLocalStorageUser.doneData,(_, payload) => payload)
    .on(setCurrentUser, (_, payload) => payload).reset(resetCurrentUser);

readLocalStorageUser()