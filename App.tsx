import React, { useState, useCallback, useEffect } from 'react';
import { GameState, PlayerState, GameEvent, TimeOfDay, Season, InventoryItem, Location, Choice, Weather, NPCName, ActionType, Request } from './types';
import { generateGameEvent, generateEventImage, generateChoiceFromInput } from './services/geminiService';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import PlayerStats from './components/PlayerStats';
import InventoryPanel from './components/InventoryPanel';
import FarmStatusPanel from './components/FarmStatusPanel';
import DiscoveryJournalPanel from './components/DiscoveryJournalPanel';
import QuestLogPanel from './components/QuestLogPanel';
import { JournalIcon, QuestIcon } from './components/Icons';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
    const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
    const [eventImage, setEventImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [history, setHistory] = useState<string[]>([]);
    const [isJournalOpen, setIsJournalOpen] = useState(false);
    const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);

    const advanceDay = useCallback((currentPlayerState: PlayerState): PlayerState => {
        let nextState = { ...currentPlayerState };
        
        const nextDay = nextState.day + 1;
        
        const updatedCrops = nextState.plantedCrops.map(crop => ({
            ...crop,
            growthProgress: crop.growthProgress + 1,
        })).filter(crop => crop.growthProgress <= crop.growthDuration);

        const updatedAnimals = nextState.farmAnimals.map(animal => ({
            ...animal,
            canProduce: true, 
        }));
        
        let newSeason = nextState.season;
        if (nextDay > 1 && (nextDay - 1) % 7 === 0) { 
            const seasonProgression: Record<Season, Season> = {
                [Season.XUAN]: Season.HA,
                [Season.HA]: Season.THU,
                [Season.THU]: Season.DONG,
                [Season.DONG]: Season.XUAN,
            };
            newSeason = seasonProgression[nextState.season];
        }
        
        const weatherOptions = Object.values(Weather);
        const newWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

        if (nextState.hasMagicalSpring) {
            nextState.spirit = Math.min(200, nextState.spirit + 5);
        }

        if (nextState.activeBlessing) {
            nextState.activeBlessing.turnsLeft -= 1;
            if (nextState.activeBlessing.turnsLeft <= 0) {
                nextState.activeBlessing = null;
            }
        }
        
        // Reset world event for the new day
        nextState.activeWorldEvent = null;

        return {
            ...nextState,
            day: nextDay,
            season: newSeason,
            weather: newWeather,
            plantedCrops: updatedCrops,
            farmAnimals: updatedAnimals,
            timeOfDay: TimeOfDay.SANG,
        };
    }, []);

    const getNewEvent = useCallback(async (newHistory: string[], nextPlayerState: PlayerState) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const eventData = await generateGameEvent(newHistory, nextPlayerState);
            setCurrentEvent(eventData);

            let eventHistory = [eventData.description];
            if (eventData.worldEvent) {
                 eventHistory.unshift(`✨ ${eventData.worldEvent.description}`);
            }
            setHistory(prev => [...prev.slice(-10), ...eventHistory]);

            // Update player state with data from event
            setPlayerState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    npcLocations: eventData.updatedNpcLocations ?? prev.npcLocations,
                    activeWorldEvent: eventData.worldEvent ?? prev.activeWorldEvent,
                };
            });
            
            const image = await generateEventImage(eventData.imagePrompt);
            setEventImage(image);

        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const startGame = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        
        const initialPlayerState: PlayerState = {
            spirit: 100,
            inventory: [],
            day: 1,
            timeOfDay: TimeOfDay.SANG,
            season: Season.XUAN,
            location: Location.RUNG,
            weather: Weather.NANG_CHAN_HOA,
            hasDiscoveredClearing: false,
            isFarmBuilt: false,
            farmAnimals: [],
            plantedCrops: [],
            discoveryJournal: { items: {}, animals: {} },
            hasMetAelin: false,
            aelinFriendship: 0,
            hasDiscoveredLake: false,
            hasMagicalSpring: false,
            hasMetKael: false,
            kaelFriendship: 0,
            hasMetElara: false,
            elaraFriendship: 0,
            upgradedTools: { fishingRod: false },
            activeBlessing: null,
            npcLocations: {
                [NPCName.Aelin]: null,
                [NPCName.Kael]: null,
                [NPCName.Elara]: null,
            },
            activeRequests: [],
            activeWorldEvent: null,
        };
        setPlayerState(initialPlayerState);
        setGameState(GameState.PLAYING);

        const initialHistory: string[] = ["Bạn thức dậy giữa một khu rừng xa lạ, không khí trong lành và thanh bình."];
        setHistory(initialHistory);
        
        await getNewEvent(initialHistory, initialPlayerState);
    }, [getNewEvent]);

    const handleChoice = useCallback(async (choice: Choice) => {
        if (!playerState || isLoading) return;

        setIsLoading(true);
        let nextPlayerState = { ...playerState };
        let newHistory = [...history, choice.outcome];
        
        // Update stats
        nextPlayerState.spirit += choice.statChanges?.spirit ?? 0;
        
        // Update friendship
        if (choice.friendshipChange) {
            nextPlayerState.aelinFriendship += choice.friendshipChange.aelin ?? 0;
            nextPlayerState.kaelFriendship += choice.friendshipChange.kael ?? 0;
            nextPlayerState.elaraFriendship += choice.friendshipChange.elara ?? 0;
        }

        // Add items to inventory and journal
        if (choice.itemsGained) {
            const newJournalItems = { ...nextPlayerState.discoveryJournal.items };
            choice.itemsGained.forEach(item => {
                nextPlayerState.inventory.push(item);
                if (!newJournalItems[item.name]) {
                    newJournalItems[item.name] = item;
                }
            });
            nextPlayerState.discoveryJournal = { ...nextPlayerState.discoveryJournal, items: newJournalItems };
        }
        
        // Use item from inventory
        if (choice.itemToUse) {
            const itemIndex = nextPlayerState.inventory.findIndex(i => i.name === choice.itemToUse);
            if (itemIndex > -1) {
                nextPlayerState.inventory.splice(itemIndex, 1);
            }
        }
        
        // Add animal to farm and journal
        if (choice.animalGained) {
            const newAnimal = { ...choice.animalGained, canProduce: true };
            nextPlayerState.farmAnimals.push(newAnimal);
            const newJournalAnimals = { ...nextPlayerState.discoveryJournal.animals };
            if (!newJournalAnimals[newAnimal.name]) {
                newJournalAnimals[newAnimal.name] = newAnimal;
            }
            nextPlayerState.discoveryJournal = { ...nextPlayerState.discoveryJournal, animals: newJournalAnimals };
        }
        
        let newEventNeeded = true;
        
        const timeProgression: Record<TimeOfDay, TimeOfDay | null> = {
            [TimeOfDay.SANG]: TimeOfDay.TRUA,
            [TimeOfDay.TRUA]: TimeOfDay.CHIEU,
            [TimeOfDay.CHIEU]: TimeOfDay.TOI,
            [TimeOfDay.TOI]: null,
        };

        const nextTime = timeProgression[nextPlayerState.timeOfDay];

        if (nextTime) {
            nextPlayerState.timeOfDay = nextTime;
        } else {
            nextPlayerState = advanceDay(nextPlayerState);
        }

        // Handle specific action types
        switch(choice.actionType) {
            case ActionType.DISCOVER_CLEARING:
                nextPlayerState.hasDiscoveredClearing = true;
                nextPlayerState.location = Location.KHU_TRONG;
                break;
            case ActionType.BUILD_FARMHOUSE:
                nextPlayerState.isFarmBuilt = true;
                nextPlayerState.location = Location.TRANG_TRAI;
                const woodToRemove = 20;
                const stoneToRemove = 10;
                let woodCount = 0;
                let stoneCount = 0;
                nextPlayerState.inventory = nextPlayerState.inventory.filter(item => {
                    if (item.name === 'Gỗ' && woodCount < woodToRemove) {
                        woodCount++;
                        return false;
                    }
                    if (item.name === 'Đá' && stoneCount < stoneToRemove) {
                        stoneCount++;
                        return false;
                    }
                    return true;
                });
                break;
            case ActionType.RETURN_HOME:
                nextPlayerState.location = nextPlayerState.isFarmBuilt ? Location.TRANG_TRAI : Location.KHU_TRONG;
                break;
            case ActionType.LEAVE_HOME:
                 if (playerState.location === Location.TUP_LEU_AELIN || playerState.location === Location.LO_REN_CUA_KAEL) {
                    nextPlayerState.location = Location.RUNG;
                } else if (playerState.location === Location.BO_HO_YEN_A) {
                    nextPlayerState.location = Location.RUNG;
                } else {
                    nextPlayerState.location = Location.RUNG;
                }
                break;
            case ActionType.PLANT_SEED:
                 const seedToPlant = playerState.inventory.find(i => i.name === choice.itemToUse && i.itemType === 'Hạt Giống');
                 if (seedToPlant && seedToPlant.growthDuration) {
                     const newCrop = {
                         name: seedToPlant.name.replace('Hạt Giống ', ''),
                         dayPlanted: playerState.day,
                         growthDuration: seedToPlant.growthDuration,
                         growthProgress: 0,
                     };
                     nextPlayerState.plantedCrops.push(newCrop);
                 }
                break;
             case ActionType.HARVEST_CROP:
                const cropsToHarvest = nextPlayerState.plantedCrops.filter(c => c.growthProgress >= c.growthDuration);
                const harvestedItems: InventoryItem[] = cropsToHarvest.map(c => ({
                    name: `Rau ${c.name}`,
                    description: `Một sản phẩm tươi ngon từ trang trại của bạn.`,
                    itemType: 'Thu Hoạch'
                }));
                 nextPlayerState.inventory.push(...harvestedItems);
                 nextPlayerState.plantedCrops = nextPlayerState.plantedCrops.filter(c => c.growthProgress < c.growthDuration);
                break;
            case ActionType.DISCOVER_AELIN_HUT:
                nextPlayerState.hasMetAelin = true;
                nextPlayerState.location = Location.TUP_LEU_AELIN;
                break;
            case ActionType.RETURN_TO_FOREST:
                nextPlayerState.location = Location.RUNG;
                break;
            case ActionType.DISCOVER_LAKE:
                nextPlayerState.hasDiscoveredLake = true;
                nextPlayerState.location = Location.BO_HO_YEN_A;
                break;
            case ActionType.USE_FOREST_POWER:
                if (choice.powerDetails) {
                    nextPlayerState.spirit -= choice.powerDetails.spiritCost;
                    switch(choice.powerDetails.type) {
                        case 'CREATE_SPRING':
                            nextPlayerState.hasMagicalSpring = true;
                            break;
                        case 'GROW_CROPS':
                             nextPlayerState.plantedCrops = nextPlayerState.plantedCrops.map(c => ({
                                ...c,
                                growthProgress: c.growthDuration,
                             }));
                            break;
                    }
                }
                break;
            case ActionType.DISCOVER_KAEL:
                nextPlayerState.hasMetKael = true;
                nextPlayerState.location = Location.LO_REN_CUA_KAEL;
                break;
            case ActionType.UPGRADE_TOOL:
                nextPlayerState.upgradedTools.fishingRod = true;
                let woodRemoved = 0;
                let stoneRemoved = 0;
                nextPlayerState.inventory = nextPlayerState.inventory.filter(item => {
                    if (item.name === 'Gỗ' && woodRemoved < 20) {
                        woodRemoved++; return false;
                    }
                    if (item.name === 'Đá' && stoneRemoved < 20) {
                        stoneRemoved++; return false;
                    }
                    return true;
                });
                break;
            case ActionType.DISCOVER_ELARA:
                nextPlayerState.hasMetElara = true;
                break;
            case ActionType.RECEIVE_BLESSING:
                nextPlayerState.activeBlessing = { type: 'FISHING_LUCK', turnsLeft: 2 }; 
                break;
            case ActionType.HOST_FESTIVAL:
                if(nextPlayerState.hasMetAelin) nextPlayerState.aelinFriendship += 10;
                if(nextPlayerState.hasMetKael) nextPlayerState.kaelFriendship += 10;
                if(nextPlayerState.hasMetElara) nextPlayerState.elaraFriendship += 10;
                break;
             case ActionType.ACCEPT_REQUEST:
                if (choice.requestGained) {
                    nextPlayerState.activeRequests.push(choice.requestGained);
                }
                break;
             case ActionType.COMPLETE_REQUEST:
                if (choice.requestToCompleteId) {
                    const request = nextPlayerState.activeRequests.find(r => r.id === choice.requestToCompleteId);
                    if (request) {
                        // Deduct items
                        request.requiredItems.forEach(reqItem => {
                            for (let i = 0; i < reqItem.quantity; i++) {
                                const itemIndex = nextPlayerState.inventory.findIndex(invItem => invItem.name === reqItem.name);
                                if (itemIndex > -1) {
                                    nextPlayerState.inventory.splice(itemIndex, 1);
                                }
                            }
                        });
                        // Add rewards
                        if(request.reward.items) nextPlayerState.inventory.push(...request.reward.items);
                        if(request.reward.friendship) {
                             if(request.npc === NPCName.Aelin) nextPlayerState.aelinFriendship += request.reward.friendship;
                             if(request.npc === NPCName.Kael) nextPlayerState.kaelFriendship += request.reward.friendship;
                             if(request.npc === NPCName.Elara) nextPlayerState.elaraFriendship += request.reward.friendship;
                        }
                        // Remove request
                        nextPlayerState.activeRequests = nextPlayerState.activeRequests.filter(r => r.id !== choice.requestToCompleteId);
                    }
                }
                break;
        }
        
        if (nextPlayerState.spirit <= 0) {
            setGameState(GameState.GAME_OVER);
            setPlayerState(nextPlayerState);
            setIsLoading(false);
            return;
        }

        setPlayerState(nextPlayerState);
        
        if (newEventNeeded) {
            await getNewEvent(newHistory, nextPlayerState);
        } else {
             setIsLoading(false);
        }

    }, [playerState, isLoading, history, advanceDay, getNewEvent]);
    
     const handleTextInputSubmit = useCallback(async (text: string) => {
        if (!playerState || isLoading || !text.trim()) return;

        setIsLoading(true);
        setErrorMessage('');
        const newHistory = [...history, `> ${text}`];
        setHistory(newHistory);

        try {
            const choice = await generateChoiceFromInput(text, playerState);
            await handleChoice(choice);
        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "Đã xảy ra lỗi khi diễn giải hành động của bạn.");
            setIsLoading(false);
        }
    }, [playerState, isLoading, history, handleChoice]);

    const onRestart = useCallback(() => {
        setGameState(GameState.START_SCREEN);
        setPlayerState(null);
        setCurrentEvent(null);
        setEventImage('');
        setHistory([]);
        setIsJournalOpen(false);
        setIsQuestLogOpen(false);
        setErrorMessage('');
    }, []);

    const mainContent = () => {
        switch (gameState) {
            case GameState.START_SCREEN:
                return <StartScreen onStart={startGame} isLoading={isLoading} />;
            case GameState.GAME_OVER:
            case GameState.PLAYING:
                 if (!playerState) return <StartScreen onStart={startGame} isLoading={isLoading} />;
                 return (
                     <div className="w-full flex flex-col items-center">
                         <div className="w-full max-w-5xl">
                            <PlayerStats playerState={playerState} />
                         </div>
                         <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-1 h-full">
                                <InventoryPanel inventory={playerState.inventory} />
                            </div>
                            <div className="md:col-span-2 h-full">
                               <FarmStatusPanel isFarmBuilt={playerState.isFarmBuilt} animals={playerState.farmAnimals} crops={playerState.plantedCrops} />
                            </div>
                         </div>
                         <div className="w-full max-w-4xl">
                             <GameScreen
                                 event={currentEvent}
                                 image={eventImage}
                                 onChoice={handleChoice}
                                 isLoading={isLoading}
                                 isGameOver={gameState === GameState.GAME_OVER}
                                 onRestart={onRestart}
                                 onTextInputSubmit={handleTextInputSubmit}
                             />
                         </div>
                     </div>
                 );
            default:
                return <StartScreen onStart={startGame} isLoading={isLoading} />;
        }
    };

    return (
        <div className="container mx-auto max-w-7xl p-4 min-h-screen flex flex-col items-center justify-start relative">
             <div className="fixed top-4 right-4 z-30 flex flex-col gap-3">
                <button
                    onClick={() => setIsJournalOpen(true)}
                    className="p-3 bg-forest-card/70 backdrop-blur-sm rounded-full shadow-lg text-curiosity-gold hover:text-white hover:bg-forest-card transition-all"
                    aria-label="Mở Sổ Tay Khám Phá"
                >
                    <JournalIcon />
                </button>
                 <button
                    onClick={() => setIsQuestLogOpen(true)}
                    className="p-3 bg-forest-card/70 backdrop-blur-sm rounded-full shadow-lg text-green-400 hover:text-white hover:bg-forest-card transition-all"
                    aria-label="Mở Sổ Ghi Chép Nhiệm Vụ"
                >
                    <QuestIcon />
                </button>
            </div>
            {isJournalOpen && playerState && (
                <DiscoveryJournalPanel journal={playerState.discoveryJournal} onClose={() => setIsJournalOpen(false)} />
            )}
             {isQuestLogOpen && playerState && (
                <QuestLogPanel requests={playerState.activeRequests} onClose={() => setIsQuestLogOpen(false)} />
            )}
            <h1 className="text-4xl sm:text-5xl font-serif text-forest-header my-6 text-center">Thung Lũng An Yên</h1>
            <div className="w-full flex-grow flex items-center justify-center">
                 {errorMessage ? <p className="text-red-400 text-center">{errorMessage}</p> : mainContent()}
            </div>
        </div>
    );
};

export default App;