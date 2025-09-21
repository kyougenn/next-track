import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NumberInput({ label, value, onChange, placeholder }) {
    return (
        <div className='flex flex-col mb-4'>
            <label className='text-white mb-1 text-sm font-semibold'>{label}</label>
            <input type="number" value={value} onChange={onChange} placeholder={placeholder} className='bg-neutral-800 text-white rounded-md p-2 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500'
            />
        </div>
    );
}

function TextInput({ label, value, onChange, placeholder }) {
    return (
        <div className='flex flex-col mb-4'>
            <label className='text-white mb-1 text-sm font-semibold'>{label}</label>
            <textarea value={value} onChange={onChange} placeholder={placeholder} rows="6" className='bg-neutral-800 text-white rounded-md p-2 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs'
            />
        </div>
    );
}

function User({ user, setUser }) {
    const api = `${process.env.REACT_APP_API || 'http://localhost:8080/api/v1'}/users`;

    const [ttl, setTtl] = useState(24);
    const [likedSongs, setLikedSongs] = useState('');
    const [dislikedSongs, setDislikedSongs] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.id) {
            axios.get(`${api}?id=${user.id}`).then((response) => {
                setUser(response.data);
            }).catch((err) => {
                console.error(err);
                setUser({});
            })
        }

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    useEffect(() => {
        if (user && user.id) {
            setLikedSongs(user.tracks?.join('\n') || '');
            setDislikedSongs(user.ignored_tracks?.join('\n') || '');
        }
    }, [user]);

    return (
        <div className='bg-neutral-900 min-w-[400px] max-w-[600px] w-auto mr-[12px] p-4 rounded-2xl flex flex-col mb-[12px]'>
            {!user?.id ? (
                <div>
                    <h2 className='text-white text-lg font-bold mb-4'>Create User Account</h2>
                    <NumberInput label="Account TTL (in hours)" value={ttl} onChange={(e) => setTtl(e.target.value)}/>
                    <button onClick={() => {
                        if (loading) {
                            return
                        };
                        setLoading(true);

                        axios.put(`${api}?ttl=${ttl}`).then((response) => {
                            setUser({
                                ...response.data,
                                tracks: []
                            });
                        }).catch((err) => {
                            console.error(err);
                        }).finally(() => {
                            setLoading(false);
                        })
                    }} disabled={loading} className='w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50'>
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            ) : (
                <div>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-white text-lg font-bold'>Manage User</h2>
                        <button onClick={() => {
                            if (!user.id || loading) {
                                return;
                            };
                            setLoading(true);

                            axios.get(`${api}?id=${user.id}`).then((response) => {
                                setUser(response.data);
                            }).catch((err) => {
                                console.error(err);
                            }).finally(() => {
                                setLoading(false);
                            })
                        }} disabled={loading} className='text-xs text-cyan-400 hover:underline'>Refresh</button>
                    </div>
                    <p className='text-neutral-400 text-sm mb-4'>User Session ID: <span className='font-mono text-white'>{user.id}</span></p>
                    <NumberInput label="Update TTL (in hours)" value={ttl} onChange={(e) => setTtl(e.target.value)}/>
                    <TextInput label="Liked Song IDs (one per line)" value={likedSongs} onChange={(e) => setLikedSongs(e.target.value)} placeholder="2Y0wPrPQBrGhoLn14xRYCG"/>
                    <TextInput label="Disliked Song IDs (one per line)" value={dislikedSongs} onChange={(e) => setDislikedSongs(e.target.value)} placeholder="01F8B0dhzGdWvmcSO6vUdi"/>
                    <div className='flex gap-x-2 mt-2'>
                        <button onClick={() => {
                            if (!user.id || loading) {
                                return;
                            };
                            setLoading(true);

                            const body = {
                                tracks: likedSongs.split('\n').filter(id => id.trim() !== ''),
                                ignored_tracks: dislikedSongs.split('\n').filter(id => id.trim() !== '')
                            };

                            axios.post(`${api}?id=${user.id}&ttl=${ttl}`, body).then((response) => {
                                setUser(response.data);
                            }).catch((err) => {
                                console.error(err);
                            }).finally(() => {
                                setLoading(false);
                            })
                        }} disabled={loading} className='w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50'>
                            { loading ? 'Saving...' : 'Save Changes' }
                        </button>
                        <button onClick={async () => {
                            if (!user.id || loading) {
                                return;
                            };

                            if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
                                setLoading(true);

                                axios.delete(`${api}?id=${user.id}`).then((response) => {
                                    setUser({});
                                    setTtl(24);
                                }).catch((err) => {
                                    console.error(err);
                                }).finally(() => {
                                    setLoading(false);
                                })
                            }
                        }} disabled={loading} className='w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50'>Delete User</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default User;