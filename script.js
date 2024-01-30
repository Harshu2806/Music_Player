
let CurrentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00";
    }

    const roundedSeconds = Math.floor(seconds); // Round down to the nearest whole second
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Example usage:
const totalSeconds = 75.789; // Example with decimal seconds
const formattedTime = formatTime(totalSeconds);

console.log(formattedTime);  // Output: "01:15"



async function getSongs(folder) {
    try {
        currFolder = folder;
        let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
        if (!a.ok) {
            throw new Error(`HTTP error! Status: ${a.status}`);
        }

        let response = await a.text();

        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                // Split the href and use the second part to get the song name
                let songName = element.href.split(`/${folder}/`)[1];

                songs.push(songName);
            }
        }

        //show all the songs in palylist
        let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
        songUL.innerHTML = ""


        for (const song of songs) {
            songUL.innerHTML = songUL.innerHTML + `<li><img src="img/music.svg" alt="music">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
            </div>
             <div class="playnow">
                <span>Play Now</span>
                </div>
             </li>`;
        }

        //attach event listner to each song
        play.src = CurrentSong.paused ? "img/play.svg" : "pause.svg";

        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                console.log(e.querySelector(".info").firstElementChild.innerHTML)
                playMusic(e.querySelector(".info").firstElementChild.innerHTML)
            })


        })


        return songs;
    } catch (error) {
        //console.error("Error fetching songs:", error);
        return []; // or handle the error in an appropriate way
    }
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio(/songs/ + track)
    CurrentSong.src = `/${currFolder}/` + track
    if (!pause) {
        CurrentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbum() {

    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    if (!a.ok) {
        throw new Error(`HTTP error! Status: ${a.status}`);
    }

    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="play"><img src="img/play_btn.svg" alt="" >
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.Description}</p>
            </div>`


        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

            playMusic(songs[0])

        })
    })

}

async function main() {
    try {
        await getSongs("songs/ncs");
        playMusic(songs[0], true)

        //dispaly all the albums on the page
        displayAlbum()

        //Attach an event listner to play
        play.addEventListener("click", () => {
            if (CurrentSong.paused) {
                CurrentSong.play()
                play.src = "img/pause.svg"
            }
            else {
                CurrentSong.pause()
                play.src = "img/play.svg"
            }
        })




        //timeupdate event
        CurrentSong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = `${formatTime(CurrentSong.currentTime)}/${formatTime(CurrentSong.duration)}`
            document.querySelector(".circle").style.left = (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
        })

        //add eventlistner to seekbar
        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            CurrentSong.currentTime = ((CurrentSong.duration) * percent) / 100;
        })

        // add event listner for hamburger
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        })

        //add event listner for close
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        })

        //add event listner for previous and next
        previous.addEventListener("click", () => {
            CurrentSong.pause()
            console.log("Previous clicked")
            console.log(CurrentSong)
            let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0])
            if ((index - 1) > 0) {
                playMusic(songs[index - 1])
            }
        })

        next.addEventListener("click", () => {
            CurrentSong.pause()
            console.log("Next clicked")

            let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0])
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
                currentIndex = index + 1;
            }

        })

        //add event listner for volume
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            const normalizedVolume = Math.max(0, Math.min(1, parseFloat(e.target.value) / 100));

            console.log("Setting volume to", normalizedVolume);

            // Set the volume of CurrentSong
            CurrentSong.volume = normalizedVolume;
            if (CurrentSong.volume > 0) {
                document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
            }
        })

        //add event listner to mute the track
        document.querySelector(".volume>img").addEventListener("click", e => {
            if (e.target.src.endsWith("volume.svg")) {
                e.target.src = "img/mute.svg"
                CurrentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            }
            else {
                e.target.src = "img/volume.svg"
                CurrentSong.volume = 1;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            }
        })








    } catch (error) {
        //console.error("Error in main:", error);

    }
}

main();
