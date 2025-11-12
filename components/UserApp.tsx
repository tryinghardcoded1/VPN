import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_DATA } from '../constants';
import { AppData, Server, User, Subscription, SubscriptionType } from '../types';
import { GlobeIcon, SpeedometerIcon, UserIcon, DxvpnLogo, LocationMarkerIcon, GiftIcon, SpinnerIcon, CheckCircleIcon } from './Icons';

type UserPage = 'home' | 'speed' | 'map' | 'profile' | 'free';

export const UserApp: React.FC = () => {
    const [data] = useLocalStorage<AppData>('dx-vpn-data', INITIAL_DATA);
    // For demo, we'll assume we are user-1
    const currentUser = data.users[0]; 
    const currentSub = data.subscriptions.find(s => s.id === currentUser.subscriptionId);
    
    const [page, setPage] = useState<UserPage>('home');
    const [isConnected, setIsConnected] = useState(false);
    const [selectedServer, setSelectedServer] = useState<Server | null>(data.servers[0] || null);
    const [time, setTime] = useState('00:00:00');

    useEffect(() => {
        let timer: number;
        if (isConnected) {
            let seconds = 0;
            timer = window.setInterval(() => {
                seconds++;
                setTime(new Date(seconds * 1000).toISOString().substr(11, 8));
            }, 1000);
        } else {
            setTime('00:00:00');
        }
        return () => window.clearInterval(timer);
    }, [isConnected]);

    const availableServers = data.servers.filter(server => 
        currentSub?.type === SubscriptionType.PREMIUM ? true : server.provideTo === 'Free'
    );
    
    const renderContent = () => {
        switch(page) {
            case 'home': return <HomeView isConnected={isConnected} setIsConnected={setIsConnected} selectedServer={selectedServer} time={time} availableServers={availableServers} setSelectedServer={setSelectedServer} />;
            case 'speed': return <SpeedView />;
            case 'map': return <MapView servers={data.servers} setSelectedServer={(server) => { setSelectedServer(server); setPage('home'); }}/>;
            case 'profile': return <ProfileView user={currentUser} subscription={currentSub} />;
            case 'free': return <FreeInternetView />;
            default: return <HomeView isConnected={isConnected} setIsConnected={setIsConnected} selectedServer={selectedServer} time={time} availableServers={availableServers} setSelectedServer={setSelectedServer} />;
        }
    }

    const navItems = [
        { id: 'home', label: 'Home', icon: DxvpnLogo },
        { id: 'speed', label: 'Speed', icon: SpeedometerIcon },
        { id: 'map', label: 'Map', icon: GlobeIcon },
        { id: 'free', label: 'Free Internet', icon: GiftIcon },
        { id: 'profile', label: 'Profile', icon: UserIcon },
    ];
    
    return (
        <div className="max-w-md mx-auto min-h-[calc(100vh-68px)] flex flex-col bg-dx-light-2 dark:bg-dx-dark-2 shadow-2xl md:my-4 md:rounded-2xl overflow-hidden">
            <div className="flex-1 p-6">
                {renderContent()}
            </div>
            <nav className="flex justify-around p-2 bg-dx-light-3 dark:bg-dx-dark-3">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setPage(item.id as UserPage)} className={`flex flex-col items-center p-2 rounded-lg w-20 transition-colors ${page === item.id ? 'text-dx-accent' : 'text-dx-gray'}`}>
                        <item.icon className="h-7 w-7 mb-1" />
                        <span className="text-xs">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

// Sub-components for each user page

const HomeView: React.FC<{
    isConnected: boolean;
    setIsConnected: (v: boolean) => void;
    selectedServer: Server | null;
    time: string;
    availableServers: Server[];
    setSelectedServer: (s: Server) => void;
}> = ({ isConnected, setIsConnected, selectedServer, time, availableServers, setSelectedServer }) => {
    return (
        <div className="flex flex-col items-center justify-between h-full text-center">
            <div className="w-full">
                <h2 className="text-2xl font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</h2>
                <p className="text-dx-gray">{isConnected ? `Your IP: ${selectedServer?.serverIp}` : 'Your IP: 127.0.0.1'}</p>
                <p className="text-2xl font-mono mt-4">{time}</p>
            </div>
            
            <button
                onClick={() => setIsConnected(!isConnected)}
                className={`my-8 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isConnected
                        ? 'bg-dx-accent shadow-dx-glow border-4 border-dx-dark'
                        : 'bg-dx-dark-3 border-4 border-dx-gray'
                }`}
            >
                <span className="text-4xl font-bold text-white">
                    {isConnected ? 'STOP' : 'TAP'}
                </span>
            </button>
            
            <div className="w-full">
                <select 
                    value={selectedServer?.id || ''} 
                    onChange={e => {
                        const server = availableServers.find(s => s.id === e.target.value);
                        if (server) setSelectedServer(server);
                    }}
                    className="w-full bg-dx-light-3 dark:bg-dx-dark-3 p-4 rounded-lg text-center appearance-none text-lg"
                    disabled={isConnected}
                >
                    {availableServers.map(s => (
                        <option key={s.id} value={s.id}>{s.countryName} - {s.protocol}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const SpeedView: React.FC = () => {
    // Mock data for speed test
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Speed Test</h2>
            <div className="relative w-64 h-32 mx-auto mb-8">
                <div className="absolute inset-0 border-8 border-dx-dark-3 rounded-t-full border-b-0"></div>
                <div className="absolute bottom-0 left-1/2 w-2 h-16 bg-dx-accent transform -translate-x-1/2 origin-bottom rotate-[-45deg] rounded-full"></div>
            </div>
            <div className="flex justify-around">
                <div>
                    <p className="text-dx-gray">Download</p>
                    <p className="text-3xl font-bold">128.5 <span className="text-lg">Mbps</span></p>
                </div>
                <div>
                    <p className="text-dx-gray">Upload</p>
                    <p className="text-3xl font-bold">88.2 <span className="text-lg">Mbps</span></p>
                </div>
            </div>
        </div>
    );
};

const MapView: React.FC<{servers: Server[], setSelectedServer: (s: Server) => void}> = ({ servers, setSelectedServer }) => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-4 text-center">Select a Location</h2>
            <div className="relative aspect-video bg-dx-dark-3 rounded-lg overflow-hidden">
                {/* Simplified map representation */}
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M50,1 L99,25 L50,49 L1,25 Z" fill="#1a1a2e" />
                  <path d="M1,25 L50,1 M50,49 L99,25" stroke="#2a2a4f" strokeWidth="0.5"/>
                </svg>
                {servers.map(server => {
                    // Simple projection. Not accurate.
                    const x = 50 + (server.longitude / 3.6);
                    const y = 25 - (server.latitude / 3.6);
                    return (
                        <button 
                            key={server.id} 
                            onClick={() => setSelectedServer(server)} 
                            style={{ left: `${x}%`, top: `${y}%` }} 
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group p-2"
                            aria-label={`Select server in ${server.countryName}`}
                        >
                            <LocationMarkerIcon className="w-6 h-6 text-dx-accent animate-pulse group-hover:animate-none group-hover:text-dx-accent-2 transition-all duration-200 transform group-hover:scale-150" />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-dx-dark-2 text-white px-2 py-1 rounded-md text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {server.countryName}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

const ProfileView: React.FC<{ user: User, subscription?: Subscription }> = ({ user, subscription }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">{user.name}</h2>
            <div className="bg-dx-light-3 dark:bg-dx-dark-3 p-4 rounded-lg">
                <p className="text-dx-gray">Email</p>
                <p>{user.email}</p>
            </div>
            <div className="bg-dx-light-3 dark:bg-dx-dark-3 p-4 rounded-lg">
                <p className="text-dx-gray">Current Plan</p>
                <p className="font-bold text-dx-accent text-lg">{subscription?.name || 'N/A'}</p>
            </div>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1"><p>Bandwidth Usage</p><p>{user.bandwidthUsage} GB</p></div>
                    <div className="w-full bg-dx-dark-3 rounded-full h-2.5"><div className="bg-dx-accent h-2.5 rounded-full" style={{width: `${user.bandwidthUsage/5}%`}}></div></div>
                </div>
                 <div>
                    <div className="flex justify-between mb-1"><p>Data Usage</p><p>{user.dataUsage} GB</p></div>
                    <div className="w-full bg-dx-dark-3 rounded-full h-2.5"><div className="bg-dx-accent-2 h-2.5 rounded-full" style={{width: `${user.dataUsage/2}%`}}></div></div>
                </div>
            </div>
            {subscription?.type === SubscriptionType.FREE && <button className="w-full bg-dx-accent text-dx-dark font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity">Upgrade to Premium</button>}
        </div>
    );
};

const FreeInternetView: React.FC = () => {
    type ConnectionStatus = 'idle' | 'loading' | 'tunneling' | 'connected';
    const [status, setStatus] = useState<ConnectionStatus>('idle');

    useEffect(() => {
        if (status === 'loading') {
            const tunnelingTimer = setTimeout(() => {
                setStatus('tunneling');
            }, 4000); // 4 seconds for loading

            const connectedTimer = setTimeout(() => {
                setStatus('connected');
            }, 10000); // 4s loading + 6s tunneling = 10s total

            return () => {
                clearTimeout(tunnelingTimer);
                clearTimeout(connectedTimer);
            };
        }
    }, [status]);

    const handleStart = () => {
        setStatus('loading');
    };
    
    const handleReset = () => {
        setStatus('idle');
    }

    const renderStatus = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <SpinnerIcon className="w-24 h-24 text-dx-accent mb-6 animate-spin" />
                        <h2 className="text-3xl font-bold mb-4">Loading...</h2>
                        <p className="text-dx-gray mb-8 max-w-xs">
                            Establishing a secure connection. Please wait.
                        </p>
                    </>
                );
            case 'tunneling':
                return (
                    <>
                        <GlobeIcon className="w-24 h-24 text-dx-accent mb-6 animate-pulse" />
                        <h2 className="text-3xl font-bold mb-4">Tunneling...</h2>
                        <p className="text-dx-gray mb-8 max-w-xs">
                            Encrypting your traffic and routing through our secure servers.
                        </p>
                    </>
                );
            case 'connected':
                return (
                    <>
                        <CheckCircleIcon className="w-24 h-24 text-green-400 mb-6" />
                        <h2 className="text-3xl font-bold mb-4 text-green-400">Connected</h2>
                        <p className="text-dx-gray mb-8 max-w-xs">
                            You are now connected to the free internet.
                        </p>
                        <button onClick={handleReset} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity">
                            Disconnect
                        </button>
                    </>
                );
            case 'idle':
            default:
                return (
                    <>
                        <GiftIcon className="w-24 h-24 text-dx-accent mb-6 animate-pulse" />
                        <h2 className="text-3xl font-bold mb-4">Unlock Free Internet</h2>
                        <p className="text-dx-gray mb-8 max-w-xs">
                           This feature is usually for Premium subscribers. Tap below for a temporary free connection.
                        </p>
                        <button onClick={handleStart} className="w-full bg-dx-accent text-dx-dark font-bold py-3 px-4 rounded-lg hover:opacity-80 transition-opacity">
                            Start Free Connection
                        </button>
                    </>
                );
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            {renderStatus()}
        </div>
    );
};