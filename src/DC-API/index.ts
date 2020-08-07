

export default class DC_API {
    public static recordSound(updTime): any {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    const recorder: MediaRecorder = new MediaRecorder(stream);
                    const sound: Array<any> = [];
                    recorder.start(updTime);
                    recorder.addEventListener("dataavailable", (event: any) => {
                        sound.push(event.data);
                    });
                    resolve((): string => {
                        recorder.stop();
                        stream.getTracks().forEach((track) => track.stop());
                        const soundBlob = new Blob(sound, {
                            type: 'audio/wav'
                        });
                        return URL.createObjectURL(soundBlob);
                    });
                });
        });
    }

    public static async getVideoStream(width: number, height: number): Promise<MediaStream> {
        const constraints = {
            video: { width: { exact: width }, height: { exact: height } }
        };
        return navigator.mediaDevices.getUserMedia(constraints);
    }
}