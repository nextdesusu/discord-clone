export type getRecordedSoundFunction = () => string;

export interface Call {
    stop: () => void;
    userStreams: any;
}

export type callbackFunction = (data: any) => void;