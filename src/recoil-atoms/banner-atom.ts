import {
    atom
} from 'recoil';

export const bannerState = atom({
    key: 'bannerState', // unique ID (with respect to other atoms/selectors)
    default: true, // default value (aka initial value)
});