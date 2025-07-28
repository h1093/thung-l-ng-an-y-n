export enum GameState {
    START_SCREEN,
    PLAYING,
    GAME_OVER,
}

export enum TimeOfDay {
    SANG = "Sáng",
    TRUA = "Trưa",
    CHIEU = "Chiều",
    TOI = "Tối",
}

export enum Season {
    XUAN = "Xuân",
    HA = "Hạ",
    THU = "Thu",
    DONG = "Đông",
}

export enum Location {
    RUNG = "Rừng",
    KHU_TRONG = "Khu Đất Trống",
    TRANG_TRAI = "Trang Trại",
    TUP_LEU_AELIN = "Túp lều của Aelin",
    BO_HO_YEN_A = "Bờ Hồ Yên Ả",
    LO_REN_CUA_KAEL = "Lò Rèn của Kael",
}

export enum Weather {
    NANG_CHAN_HOA = "Nắng Chan Hòa",
    MUA_PHUN = "Mưa Phùn",
    SUONG_MU = "Sương Mù",
}

export enum NPCName {
    Aelin = "Aelin",
    Kael = "Kael",
    Elara = "Elara"
}

export type ItemType = "Thông Thường" | "Hạt Giống" | "Thu Hoạch" | "Nguyên Liệu" | "Cá";

export interface InventoryItem {
    name: string;
    description: string;
    itemType: ItemType;
    season?: Season; // For seeds
    growthDuration?: number; // For seeds
}

export interface FarmAnimal {
    name: string;
    description: string;
    canProduce: boolean;
}

export interface PlantedCrop {
    name: string;
    dayPlanted: number;
    growthDuration: number;
    growthProgress: number;
}

export interface DiscoveryJournal {
    items: Record<string, InventoryItem>;
    animals: Record<string, FarmAnimal>;
}

export interface UpgradedTools {
    fishingRod: boolean;
}

export interface ActiveBlessing {
    type: 'FISHING_LUCK' | 'SPIRIT_REGEN';
    turnsLeft: number;
}

export interface Request {
    id: string;
    npc: NPCName;
    description: string;
    requiredItems: { name: string; quantity: number }[];
    reward: { items?: InventoryItem[], friendship?: number };
}

export interface WorldEventInfo {
    id: string;
    description: string;
}

export interface PlayerState {
    spirit: number;
    inventory: InventoryItem[];
    day: number;
    timeOfDay: TimeOfDay;
    season: Season;
    location: Location;
    weather: Weather;
    hasDiscoveredClearing: boolean;
    isFarmBuilt: boolean;
    farmAnimals: FarmAnimal[];
    plantedCrops: PlantedCrop[];
    discoveryJournal: DiscoveryJournal;
    hasMetAelin: boolean;
    aelinFriendship: number;
    hasDiscoveredLake: boolean;
    hasMagicalSpring: boolean;
    hasMetKael: boolean;
    kaelFriendship: number;
    hasMetElara: boolean;
    elaraFriendship: number;
    upgradedTools: UpgradedTools;
    activeBlessing: ActiveBlessing | null;
    npcLocations: Record<NPCName, Location | null>;
    activeRequests: Request[];
    activeWorldEvent: WorldEventInfo | null;
}

export enum ActionType {
    DEFAULT = "DEFAULT",
    DISCOVER_CLEARING = "DISCOVER_CLEARING",
    BUILD_FARMHOUSE = "BUILD_FARMHOUSE",
    RETURN_HOME = "RETURN_HOME",
    LEAVE_HOME = "LEAVE_HOME",
    PLANT_SEED = "PLANT_SEED",
    HARVEST_CROP = "HARVEST_CROP",
    BEFRIEND_ANIMAL = "BEFRIEND_ANIMAL",
    TEND_ANIMAL = "TEND_ANIMAL",
    DISCOVER_AELIN_HUT = "DISCOVER_AELIN_HUT",
    RETURN_TO_FOREST = "RETURN_TO_FOREST",
    TALK_TO_AELIN = "TALK_TO_AELIN",
    DISCOVER_LAKE = "DISCOVER_LAKE",
    FISH = "FISH",
    USE_FOREST_POWER = "USE_FOREST_POWER",
    DISCOVER_KAEL = "DISCOVER_KAEL",
    TALK_TO_KAEL = "TALK_TO_KAEL",
    UPGRADE_TOOL = "UPGRADE_TOOL",
    DISCOVER_ELARA = "DISCOVER_ELARA",
    TALK_TO_ELARA = "TALK_TO_ELARA",
    RECEIVE_BLESSING = "RECEIVE_BLESSING",
    HOST_FESTIVAL = "HOST_FESTIVAL",
    ACCEPT_REQUEST = "ACCEPT_REQUEST",
    COMPLETE_REQUEST = "COMPLETE_REQUEST",
}


export interface PowerDetails {
    type: 'CREATE_SPRING' | 'GROW_CROPS';
    spiritCost: number;
}

export interface Choice {
    text: string;
    outcome: string;
    actionType: ActionType;
    statChanges?: {
        spirit?: number;
    };
    friendshipChange?: {
        aelin?: number;
        kael?: number;
        elara?: number;
    };
    itemsGained?: InventoryItem[];
    animalGained?: {
        name: string;
        description: string;
    };
    itemToUse?: string;
    powerDetails?: PowerDetails;
    requestGained?: Request;
    requestToCompleteId?: string;
}

export interface GameEvent {
    description: string;
    imagePrompt: string;
    choices: Choice[];
    worldEvent?: WorldEventInfo;
    updatedNpcLocations?: Record<NPCName, Location | null>;
}