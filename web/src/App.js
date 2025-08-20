import React from 'react';
import axios from 'axios';

function App() {
    const api = 'http://localhost:8080/api/v1';

    const [data, setData] = React.useState({});

    let form = {
        "attributes": {
            "danceability": {
                "target": 0.9,
                "deviation": 0.1
            }
        },
        "tuning": {
            "popularity": {
                "min": 0,
                "max": 100
            },
            "tempo": {
                "min": 0,
                "max": 200
            },
            "explicit": 1
        }
    };

    React.useEffect(() => {
        // if (window.localStorage.getItem('user') !== null) {
            // window.localStorage.setItem('user', '');
        // }
        getSong();
    }, [])

    function getSong() {
        axios.post(`${api}/radio/listen`, form).then((response) => {
            setData(response.data);
        }).catch((err) => {
            console.log(err);
        })
    }

    return (
        <div className="App">
            <p className="text-9xl">Test</p>
            <button onClick={() => {
                getSong();
            }}>Next</button>

            {
                data.image ? <img src={data.image}></img> : <></>
            }

            {
                data.preview ?
                <div>
                    <audio preload="none" src={data.preview} type="audio/mpeg" controls>
                        Your browser does not support audio playback.
                    </audio>
                    <a href={data.preview}> Download audio </a>
                </div> : <></>
            }
        </div>
    );
}

export default App;