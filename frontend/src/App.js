import React from 'react';
import axios from 'axios';

import Settings from './components/settings'
import User from './components/user'

function App() {
    const api = process.env.REACT_APP_API || 'http://localhost:8080/api/v1';

    const [data, setData] = React.useState({});
    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')) == null ? {} : JSON.parse(localStorage.getItem('user')));
    const [form, setForm] = React.useState(JSON.parse(localStorage.getItem('preferences')) == null ? {
        "attributes": { "enabled": false, "danceability": { "target": 0.5, "deviation": 0.5, "enabled": false }, "energy": { "target": 0.5, "deviation": 0.5, "enabled": false }, "speechiness": { "target": 0.5, "deviation": 0.5, "enabled": false }, "acousticness": { "target": 0.5, "deviation": 0.5, "enabled": false }, "instrumentalness": { "target": 0.5, "deviation": 0.5, "enabled": false }, "liveness": { "target": 0.5, "deviation": 0.5, "enabled": false }, "valence": { "target": 0.5, "deviation": 0.5, "enabled": false } },
        "tuning": { "enabled": false, "popularity": { "min": 0, "max": 100, "enabled": false }, "tempo": { "min": 0, "max": 200, "enabled": false }, "explicit": { "value": 1, "enabled": false } }
    } : JSON.parse(localStorage.getItem('preferences')));

    const [searchByArtist, setSearchByArtist] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);

    const [notif, setNotif] = React.useState({ show: false, text: '', color: '' });

    React.useEffect(() => {
        getSong();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        localStorage.setItem('preferences', JSON.stringify(form));
    }, [form])

    React.useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user])

    React.useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }
        
        axios.get(`${api}/tools/search`, {
            params: { q: searchQuery, type: searchByArtist ? 'artist' : 'track', limit: 5 }
        }).then((response) => {
            setSearchResults(response.data || []);
        }).catch((err) => {
            console.error(err);
            setSearchResults([]);
        });

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, searchByArtist]);

    function showNotif(text, color, duration) {
        setNotif({ show: true, text, color });
        setTimeout(() => {
            setNotif({ show: false, text: '', color: '' });
        }, duration);
    };

    function getSong() {
        let body = parseForm(form);
        let url = `${api}/radio/listen`;

        if (user && user.id) {
            url += `?id=${user.id}`;
        }

        axios.post(url, body).then((response) => {
            setData(response.data);
        }).catch((err) => {
            console.log(err);
            showNotif('No Songs Found!', 'bg-red-600', 3000);
        });
    }

    return (
        <div className="bg-black flex flex-col h-screen p-[12px] overflow-hidden font-mono">
            {
                notif.show && (
                    <div className={`fixed bottom-8 right-8 ${notif.color} text-white py-[32px] px-[80px] text-[24px] rounded-lg shadow-lg z-20 font-semibold`}>
                        {notif.text}
                    </div>
                )
            }
            <div className='flex mb-[12px] items-center'>
                <p className='text-white font-bold text-[36px]'>NXTRCK</p>
                <div className='relative mx-auto w-[25%]'>
                    <input className='w-full h-[50px] rounded-3xl bg-neutral-900 pl-[28px] pb-[4px] text-white focus:outline-none focus:ring-2 focus:ring-white' placeholder='Search...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    {
                        searchResults.length > 0 && (
                            <div className='absolute top-full mt-2 w-full bg-neutral-900 rounded-lg border border-neutral-700 shadow-xl z-10'>
                                <ul>
                                    {
                                        searchResults.map(item => (
                                            <li key={item.id} className='px-4 py-2 text-white border-b border-neutral-800 last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-neutral-700' onClick={() =>  {
                                                navigator.clipboard.writeText(item.id).then(() => {
                                                    showNotif('Copied to Clipboard!', 'bg-green-600', 2000);
                                                }).catch(err => {
                                                    showNotif('Copy Failed!', 'bg-red-600', 3000);
                                                    console.error(err);
                                                });
                                            }}>
                                                <span className='truncate pr-4'>{item.name}</span>
                                                <span className='text-neutral-400 text-xs font-mono flex-shrink-0'>{item.id}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        )
                    }
                </div>
            </div>
            <div className='flex h-screen overflow-hidden'>
                <div className='flex'>
                    <Settings form={form} setForm={setForm} searchByArtist={searchByArtist} setSearchByArtist={setSearchByArtist} user={user} />
                    <User user={user} setUser={setUser} />
                </div>
                <div className='bg-gradient-to-br from-neutral-800 to-neutral-900 to-[20%] w-full rounded-2xl p-6 flex flex-col justify-between'>
                    <div>
                        <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
                            {
                                data.image ? 
                                <img className='w-64 h-64 md:w-80 md:h-80 rounded-lg object-cover flex-shrink-0 shadow-lg' src={data.image} alt={ data.name || 'Song Cover Art' }></img> : 
                                <img className='w-64 h-64 md:w-80 md:h-80 rounded-lg object-cover flex-shrink-0 shadow-lg' src="https://msp.c.yimg.jp/images/v2/FUTi93tXq405grZVGgDqG7s6XIz6WzUM9mMsixYxaAvYvygdbrnEqsjbkPRrTAsNlDYeCBch9zFjkrgSg-AEwzpvhDMA9FVYIjq2ClQoPyd-Mg8gnrnMXUD8iW90Ly3zjGd7vRm1oiz626MnvF155QKjOUp75nWGYYkI-wsYbLc7QhPuftkCSZZMMnoiXOMaGdSk4ROp7mcR8c-pAbdoBHwuLeQDKCzsu8tSX7FZjPQsQeZditBdCBreWwdrDfmHCs08KsijRavbPa-uFGa18GcWHpZXYiz5IV2bfz3rUKK2npQzaH7iz65irSaTobodr2Etz3TH-Nyjpfzp3wExGKmQvNRfMj0LyDnyEzJ1JuiLda_5C1It-wOD4htZtIXIypuoJwnNPNpKkL182hsqotfRmW7dpnq6qes87gKO56H-wvUmRX5tnr6m-c4mitVBAQ5eAx3QUUC2PDzwMRIB0NxXZEHLaqIAlR4EZ0UZQO0=/no-image-available-sign.jpg?errorImage=false" alt="Default Cover Art"></img>
                            }
                            <div className='flex flex-col gap-4 text-center md:text-left'>
                                <div>
                                    <a href={`https://open.spotify.com/track/${data.id}`} target='_blank' rel="noopener noreferrer" className='hover:underline text-white text-3xl md:text-5xl font-bold break-words'>{data.name || "Song Title"}</a>
                                    <div className='flex items-center justify-center md:justify-start flex-wrap text-neutral-300 text-lg mt-2'>
                                        {
                                            data.artists?.map((artist, i) => (
                                                <React.Fragment key={artist.id}>
                                                    <a href={`https://open.spotify.com/artist/${artist.id}`} target='_blank' rel="noopener noreferrer" className='hover:underline'>
                                                        {artist.name}
                                                    </a>
                                                    {i < data.artists.length - 1 && <span className='mr-2'>,</span>}
                                                </React.Fragment>
                                            ))
                                        }
                                    </div>
                                </div>
                                {
                                    data.id && (
                                        <div className='bg-black/20 p-3 rounded-lg mr-auto'>
                                            <div className='space-y-2 text-sm'>
                                                <div className='flex items-center justify-between'>
                                                    <p className='text-neutral-300 font-medium mr-[12px]'>Music Track</p>
                                                    <div className='flex items-center gap-2'>
                                                        <p className='font-mono text-neutral-400 bg-neutral-800 p-1 rounded text-xs truncate'>{data.id}</p>
                                                    </div>
                                                </div>
                                                {
                                                    data.artists?.map(artist => (
                                                        <div key={artist.id} className='flex items-center justify-between'>
                                                            <span className='text-neutral-300 font-medium truncate mr-[12px]'>{artist.name}</span>
                                                            <div className='flex items-center gap-2'>
                                                                <p className='font-mono text-neutral-400 bg-neutral-800 p-1 rounded text-xs truncate'>{artist.id}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className='mt-8 flex justify-center'>
                            <button className='text-white rounded-lg px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 transition-all font-semibold shadow-lg' onClick={getSong}>
                                Next Song
                            </button>
                        </div>
                    </div>
                    {
                        data.preview && (
                            <div className='mt-auto pt-4'>
                                <audio className='w-full' preload="none" src={data.preview} controls>
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

function parseObject(object) {
    if (!object || !object.enabled) {
        return null;
    }

    const parsedObject = {};

    for (const key in object) {
        if (key === 'enabled') { continue; }

        const field = object[key];
        if (field && field.enabled === true) {
            if (key === 'explicit') {
                parsedObject[key] = field.value;
            } else {
                const { enabled, ...rest } = field;
                parsedObject[key] = rest;
            }
        }
    }

    if (Object.keys(parsedObject).length > 0) {
        return parsedObject;
    }

    return null;
}

function parseForm(sourceForm) {
    const result = {};

    const attributes = parseObject(sourceForm.attributes);
    if (attributes) { result.attributes = attributes; }

    const tuning = parseObject(sourceForm.tuning);
    if (tuning) { result.tuning = tuning; }

    return result;
}

export default App;