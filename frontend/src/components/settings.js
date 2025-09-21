import React from 'react';

function Settings({ form, setForm, searchByArtist, setSearchByArtist, user }) {
    function formUpdate(section, key, value) {
        setForm((prevForm) => ({
            ...prevForm,
            [section]: {
                ...prevForm[section],
                [key]: value,
            }
        }));
    };

    return (
        <div className='bg-neutral-900 min-w-[400px] max-w-[600px] w-[20%] mr-[12px] p-4 rounded-2xl flex flex-col mb-[12px] max-h-full overflow-y-auto'>
            <Section title="attributes" data={form.attributes} onUpdate={(key, value) => formUpdate('attributes', key, value)} user={user}/>
            <Section title="tuning" data={form.tuning} onUpdate={(key, value) => formUpdate('tuning', key, value)}/>
            <Search searchByArtist={searchByArtist} setSearchByArtist={setSearchByArtist}/>
        </div>
    );
}

function Row({ attribute, contents, onUpdate, user }) {
    const target = (user && user.id && user.target && user.target[attribute] !== undefined) ? user.target[attribute].toFixed(2) : contents.target;
    function createFields() {
        const classValues = "w-full bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed";
        if ('target' in contents) {
            return (
                <>
                    <div className="w-[50%]">
                        <label className="text-xs text-neutral-400">Target</label>
                        <input className={classValues} type="number" step="0.01" disabled={!contents.enabled || (user && user.id && user.tracks != '')} value={target} onChange={(e) => onUpdate('target', parseFloat(e.target.value))} />
                    </div>
                    <div className="w-[50%]">
                        <label className="text-xs text-neutral-400">Deviation</label>
                        <input className={classValues} type="number" step="0.01" disabled={!contents.enabled} value={contents.deviation} onChange={(e) => onUpdate('deviation', parseFloat(e.target.value))} />
                    </div>
                </>
            );
        }
        if ('min' in contents) {
            return (
                <>
                    <div className="w-[50%]">
                        <label className="text-xs text-neutral-400">Min</label>
                        <input className={classValues} type="number" step="1" disabled={!contents.enabled} value={contents.min} onChange={(e) => onUpdate('min', parseFloat(e.target.value))} />
                    </div>
                    <div className="w-[50%]">
                        <label className="text-xs text-neutral-400">Max</label>
                        <input className={classValues} type="number" step="1" disabled={!contents.enabled} value={contents.max} onChange={(e) => onUpdate('max', parseFloat(e.target.value))} />
                    </div>
                </>
            );
        }
        if ('value' in contents) {
            return <input className={`${classValues} mt-2`} type="text" disabled={!contents.enabled} value={contents.value} onChange={(e) => onUpdate('value', e.target.value)} />
        }
        return null;
    };

    return (
        <div className='flex items-center my-2 gap-3'>
            <input 
                type="checkbox" 
                checked={contents.enabled} 
                onChange={() => onUpdate('enabled', !contents.enabled)} 
                className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
            />
            <div className='flex flex-col w-full'>
                <p className='text-white'>{attribute.charAt(0).toUpperCase() + attribute.slice(1)}</p>
                <div className='flex gap-x-2 mt-1'>
                    {createFields()}
                </div>
            </div>
        </div>
    );
}

function Section({ title, data, onUpdate, user }) {
    return (
        <>
            <div className={`flex items-center gap-3 ${title !== 'attributes' ? 'mt-4' : ''}`}>
                <input type="checkbox" id={title} name={title} checked={data.enabled} onChange={() => {
                    onUpdate('enabled', !data.enabled);
                }} className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-cyan-500 focus:ring-cyan-600 cursor-pointer"/>
                <label className='text-white text-lg font-semibold cursor-pointer' for={title}>
                    {title.charAt(0).toUpperCase() + title.slice(1)}
                </label>
            </div>
            {
                data.enabled && (
                    <div className='flex flex-col pl-5 border-l-2 border-neutral-700 ml-[8px] mt-2'>
                        {
                            Object.entries(data).filter(([key]) => key !== 'enabled').map(([key, contents]) => (
                                <Row key={key} attribute={key} contents={contents} onUpdate={(property, value) => onUpdate(key, { ...contents, [property]: value })} user={user}/>
                            ))
                        }
                    </div>
                )
            }
        </>
    );
}

function Search({ searchByArtist, setSearchByArtist }) {
    return (
        <div className='flex items-center gap-3 mt-4 border-t border-neutral-800 pt-4'>
            <input type="checkbox" id="searchCheckbox" name="searchCheckbox" checked={searchByArtist} onChange={() => setSearchByArtist(prev => !prev)} className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-cyan-500 focus:ring-cyan-600 cursor-pointer"/>
            <label className='text-white cursor-pointer' for="searchCheckbox">Search by Artist</label>
        </div>
    );
}

export default Settings;