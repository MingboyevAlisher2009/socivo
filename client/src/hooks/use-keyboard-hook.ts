

const keyStrokeSounds = [
    new Audio("/audio/keystroke1.mp3"),
    new Audio("/audio/keystroke2.mp3"),
    new Audio("/audio/keystroke3.mp3"),
    new Audio("/audio/keystroke4.mp3"),
];

const useKeybord = () => {
    const playRandomKeySound = () => {
        const sound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)]

        sound.currentTime = 0
        sound.play().catch((error) => console.log("Audio play failed:", error));
    }

    return { playRandomKeySound }
}

export default useKeybord