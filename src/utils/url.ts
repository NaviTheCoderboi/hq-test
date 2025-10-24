const URL_CHANGE_EVENT = 'url-change';

export const emitURLChange = () => {
    const event = new Event(URL_CHANGE_EVENT);
    window.dispatchEvent(event);
};

export const changeURL = (newURL: string) => {
    window.history.pushState({}, '', newURL);
    emitURLChange();
};

export const onURLChange = (callback: () => void) => {
    window.addEventListener(URL_CHANGE_EVENT, callback);
    return () => {
        window.removeEventListener(URL_CHANGE_EVENT, callback);
    };
};
