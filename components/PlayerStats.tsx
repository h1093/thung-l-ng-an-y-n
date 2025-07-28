import React from 'react';
import type { PlayerState } from '../types';
import { Season, TimeOfDay, Location, Weather, NPCName } from '../types';
import { HeartIcon, SunIcon, MoonIcon, LeafIcon, SnowflakeIcon, SproutIcon, SunFlowerIcon, CalendarIcon, ForestIcon, FarmIcon, ClearingIcon, RainyIcon, FoggyIcon, HutIcon, FishingRodIcon, AnvilIcon, FriendshipIcon, WaterDropIcon } from './Icons';

interface PlayerStatsProps {
    playerState: PlayerState;
}

const SeasonIcon: React.FC<{ season: Season }> = ({ season }) => {
    switch (season) {
        case Season.XUAN: return <SproutIcon className="text-green-400" />;
        case Season.HA: return <SunFlowerIcon className="text-yellow-400" />;
        case Season.THU: return <LeafIcon className="text-orange-400" />;
        case Season.DONG: return <SnowflakeIcon className="text-blue-300" />;
        default: return null;
    }
};

const TimeOfDayIcon: React.FC<{ timeOfDay: TimeOfDay }> = ({ timeOfDay }) => {
    switch (timeOfDay) {
        case TimeOfDay.SANG:
        case TimeOfDay.TRUA:
        case TimeOfDay.CHIEU:
            return <SunIcon className="text-yellow-300" />;
        case TimeOfDay.TOI:
            return <MoonIcon className="text-indigo-300" />;
        default: return null;
    }
};

const LocationIcon: React.FC<{ location: Location }> = ({ location }) => {
    switch(location) {
        case Location.RUNG: return <ForestIcon className="text-green-500" />;
        case Location.KHU_TRONG: return <ClearingIcon className="text-yellow-600" />;
        case Location.TRANG_TRAI: return <FarmIcon className="text-amber-600" />;
        case Location.TUP_LEU_AELIN: return <HutIcon className="text-purple-400" />;
        case Location.BO_HO_YEN_A: return <FishingRodIcon className="text-blue-400" />;
        case Location.LO_REN_CUA_KAEL: return <AnvilIcon className="text-orange-300" />;
        default: return null;
    }
}

const WeatherIcon: React.FC<{ weather: Weather }> = ({ weather }) => {
    switch (weather) {
        case Weather.NANG_CHAN_HOA: return <SunIcon className="text-yellow-300" />;
        case Weather.MUA_PHUN: return <RainyIcon className="text-blue-400" />;
        case Weather.SUONG_MU: return <FoggyIcon className="text-gray-400" />;
        default: return null;
    }
};

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; valueColorClass?: string }> = ({ icon, label, value, valueColorClass = "text-forest-header" }) => (
    <div className="flex items-center space-x-2">
        {icon}
        <span className="font-sans text-base sm:text-lg font-medium text-forest-header whitespace-nowrap">{label}:</span>
        <span className={`font-sans text-base sm:text-lg font-bold ${valueColorClass}`}>{value}</span>
    </div>
);

const FriendshipStat: React.FC<{ icon: React.ReactNode; name: string; level: number; isPresent: boolean; }> = ({ icon, name, level, isPresent }) => (
     <div className="flex items-center space-x-2 relative" title={`${name}: ${level}`}>
        {icon}
        {isPresent && <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-forest-card"></span>}
        <FriendshipIcon className="text-pink-400" />
        <span className="font-sans text-base sm:text-lg font-bold text-pink-300">{level}</span>
    </div>
)


const PlayerStats: React.FC<PlayerStatsProps> = ({ playerState }) => {
    return (
        <div className="w-full bg-forest-card/50 rounded-lg p-3 sm:p-4 mb-4 animate-fade-in shadow-lg border border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:flex xl:flex-wrap xl:justify-around items-center gap-y-3 gap-x-4">
                <StatItem icon={<HeartIcon className="text-spirit-light" />} label="Linh hồn" value={playerState.spirit} valueColorClass="text-spirit-light" />
                
                <div className="h-6 w-px bg-gray-600 hidden xl:block"></div>
                
                <StatItem icon={<LocationIcon location={playerState.location} />} label="Vị trí" value={playerState.location} />
                <StatItem icon={<WeatherIcon weather={playerState.weather} />} label="Thời tiết" value={playerState.weather} />
                <StatItem icon={<SeasonIcon season={playerState.season} />} label="Mùa" value={playerState.season} />
                <StatItem icon={<CalendarIcon className="text-gray-400" />} label="Ngày" value={playerState.day} />
                <StatItem icon={<TimeOfDayIcon timeOfDay={playerState.timeOfDay} />} label="Buổi" value={playerState.timeOfDay} />

                {(playerState.hasMetAelin || playerState.hasMetKael || playerState.hasMetElara) && (
                     <div className="h-6 w-px bg-gray-600 hidden xl:block"></div>
                )}

                {playerState.hasMetAelin && (
                    <FriendshipStat 
                        icon={<HutIcon className="text-purple-400"/>} 
                        name="Aelin" 
                        level={playerState.aelinFriendship} 
                        isPresent={playerState.npcLocations[NPCName.Aelin] === playerState.location}
                    />
                )}
                 {playerState.hasMetKael && (
                    <FriendshipStat 
                        icon={<AnvilIcon className="text-orange-300"/>} 
                        name="Kael" 
                        level={playerState.kaelFriendship} 
                        isPresent={playerState.npcLocations[NPCName.Kael] === playerState.location}
                    />
                )}
                 {playerState.hasMetElara && (
                    <FriendshipStat 
                        icon={<WaterDropIcon className="text-cyan-400"/>} 
                        name="Elara" 
                        level={playerState.elaraFriendship} 
                        isPresent={playerState.npcLocations[NPCName.Elara] === playerState.location}
                    />
                )}
            </div>
        </div>
    );
};

export default PlayerStats;