import {useEffect, useState} from "react";

export const useLocalStorage = (key, initState) => {
    const [value, setValue] = useState(() => {
        const storage = localStorage.getItem(key);
        if (storage) return JSON.parse(storage);
        return initState;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value]);

    return [value, setValue];
}