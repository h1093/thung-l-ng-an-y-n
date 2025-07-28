import { GoogleGenAI, Type } from "@google/genai";
import { GameEvent, PlayerState, Location, ActionType, Choice, NPCName, Request } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("Biến môi trường API_KEY chưa được đặt.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const inventoryItemSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "Tên của vật phẩm (ví dụ: 'Nấm Phát Sáng', 'Hạt Giống Cà Rốt Mùa Xuân', 'Gỗ', 'Đá', 'Cá Rô Đồng')."
        },
        description: {
            type: Type.STRING,
            description: "Mô tả ngắn, thơ mộng về vật phẩm."
        },
        itemType: {
            type: Type.STRING,
            enum: ["Thông Thường", "Hạt Giống", "Thu Hoạch", "Nguyên Liệu", "Cá"],
            description: "Loại vật phẩm. 'Nguyên Liệu' là vật liệu xây dựng (Gỗ, Đá). 'Cá' là cá bắt được từ hồ."
        },
        season: {
            type: Type.STRING,
            enum: ["Xuân", "Hạ", "Thu", "Đông"],
            description: "Mùa mà hạt giống này có thể được trồng. Bỏ qua đối với các loại vật phẩm khác."
        },
        growthDuration: {
            type: Type.INTEGER,
            description: "Số ngày cần thiết để hạt giống phát triển thành cây trồng có thể thu hoạch. Bỏ qua đối với các loại vật phẩm khác."
        }
    },
    required: ["name", "description", "itemType"]
};

const requestSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Một ID duy nhất cho yêu cầu, ví dụ: 'aelin-mushroom-quest-1'." },
        npc: { type: Type.STRING, enum: Object.values(NPCName), description: "NPC đưa ra yêu cầu." },
        description: { type: Type.STRING, description: "Mô tả ngắn về yêu cầu." },
        requiredItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Tên vật phẩm yêu cầu." },
                    quantity: { type: Type.INTEGER, description: "Số lượng yêu cầu." }
                },
                required: ["name", "quantity"]
            }
        },
        reward: {
            type: Type.OBJECT,
            properties: {
                items: { type: Type.ARRAY, items: inventoryItemSchema },
                friendship: { type: Type.INTEGER, description: "Điểm tình bạn nhận được." }
            },
        },
    },
    required: ["id", "npc", "description", "requiredItems", "reward"]
};

const choiceSchema = {
    type: Type.OBJECT,
    properties: {
        text: {
            type: Type.STRING,
            description: "Văn bản cho nút lựa chọn, thể hiện một hành động nhẹ nhàng. Bắt buộc.",
        },
        outcome: {
            type: Type.STRING,
            description: "Một mô tả ngắn, 1 câu về những gì xảy ra khi lựa chọn được thực hiện. Bắt buộc.",
        },
        actionType: {
            type: Type.STRING,
            enum: Object.values(ActionType),
            description: "Loại hành động mà lựa chọn này kích hoạt. Sử dụng các loại hành động này theo quy trình. Bắt buộc."
        },
        statChanges: {
            type: Type.OBJECT,
            description: "Lựa chọn ảnh hưởng đến chỉ số linh hồn của người chơi như thế nào.",
            properties: {
                spirit: {
                    type: Type.INTEGER,
                    description: "Thay đổi về linh hồn. Có thể là số dương hoặc âm. Một con số nhỏ, ví dụ: từ -15 đến +15."
                },
            },
        },
         friendshipChange: {
            type: Type.OBJECT,
            description: "Lựa chọn ảnh hưởng đến tình bạn với NPC như thế nào.",
            properties: {
                aelin: { type: Type.INTEGER },
                kael: { type: Type.INTEGER },
                elara: { type: Type.INTEGER },
            },
        },
        itemsGained: {
             type: Type.ARRAY,
             description: "Một mảng các vật phẩm người chơi thu thập được từ lựa chọn này. Có thể là mảng rỗng.",
             items: inventoryItemSchema
        },
        animalGained: {
            type: Type.OBJECT,
            description: "Con vật người chơi nhận được. Chỉ định nếu actionType là 'BEFRIEND_ANIMAL'.",
            properties: {
                name: { type: Type.STRING, description: "Tên con vật, ví dụ 'Gà Con Lạc Lối'." },
                description: { type: Type.STRING, description: "Mô tả ngắn về con vật." }
            }
        },
        itemToUse: {
            type: Type.STRING,
            description: "Vật phẩm được sử dụng từ túi đồ (ví dụ: tên hạt giống để trồng khi actionType là 'PLANT_SEED')."
        },
        powerDetails: {
            type: Type.OBJECT,
            description: "Chi tiết về sức mạnh được sử dụng. Chỉ định nếu actionType là 'USE_FOREST_POWER'.",
            properties: {
                type: { type: Type.STRING, enum: ['CREATE_SPRING', 'GROW_CROPS'], description: "Loại sức mạnh được sử dụng." },
                spiritCost: { type: Type.INTEGER, description: "Chi phí linh hồn để sử dụng sức mạnh." }
            }
        },
        requestGained: { ...requestSchema, description: "Một yêu cầu mới được đưa ra cho người chơi." },
        requestToCompleteId: { type: Type.STRING, description: "ID của yêu cầu được hoàn thành." }
    },
    required: ["text", "outcome", "actionType"]
};

const eventSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.STRING,
            description: "Một đoạn văn thơ mộng, thanh bình và miêu tả về sự kiện hoặc địa điểm, phù hợp với mùa, thời gian trong ngày, vị trí và THỜI TIẾT hiện tại. Tối đa 3 câu.",
        },
        imagePrompt: {
            type: Type.STRING,
            description: "Một lời nhắc chi tiết, nghệ thuật bằng TIẾNG ANH cho một trình tạo hình ảnh. Phong cách nên là 'dreamy, ethereal, glowing, digital painting, stardew valley inspired'. Lời nhắc PHẢI phản ánh mùa, thời gian trong ngày, vị trí, THỜI TIẾT (ví dụ: 'rainy afternoon', 'foggy morning', 'sunny day') và các nhân vật có mặt.",
        },
        choices: {
            type: Type.ARRAY,
            description: "Một mảng gồm 2-3 lựa chọn cho người chơi.",
            items: choiceSchema
        },
        updatedNpcLocations: {
            type: Type.OBJECT,
            description: "Vị trí mới của tất cả các NPC trong buổi này. Bắt buộc.",
            properties: {
                [NPCName.Aelin]: { type: Type.STRING, enum: Object.values(Location), nullable: true },
                [NPCName.Kael]: { type: Type.STRING, enum: Object.values(Location), nullable: true },
                [NPCName.Elara]: { type: Type.STRING, enum: Object.values(Location), nullable: true },
            }
        },
        worldEvent: {
            type: Type.OBJECT,
            description: "Một sự kiện thế giới ngẫu nhiên xảy ra vào đầu ngày. Chỉ xảy ra một lần mỗi ngày.",
            properties: {
                id: { type: Type.STRING, description: "ID duy nhất cho sự kiện, ví dụ 'meteor-shower'." },
                description: { type: Type.STRING, description: "Mô tả về sự kiện thế giới."}
            }
        }
    },
    required: ["description", "imagePrompt", "choices", "updatedNpcLocations"]
};

function getSystemPrompt(playerState: PlayerState): string {
    let systemPrompt = `Bạn là người quản trò cho "Thung Lũng An Yên", một game RPG mô phỏng cuộc sống nhẹ nhàng. Nhiệm vụ của bạn là tạo ra các sự kiện thơ mộng, thanh bình. Luôn tuân thủ định dạng JSON được yêu cầu.

**Không khí & Chủ đề:**
- **Không khí:** Yên bình, thư giãn, một chút kỳ diệu, lấy cảm hứng từ "Isekai Nonbiri Nouka" và "Stardew Valley". Tránh các xung đột bạo lực hoặc kịch tính căng thẳng.
- **Mô tả:** Ngắn gọn (2-3 câu), giàu hình ảnh.
- **Lựa chọn:** Cung cấp 2-3 lựa chọn rõ ràng, mang tính hành động.

**THẾ GIỚI ĐỘNG (RẤT QUAN TRỌNG):**
1.  **Lịch trình NPC:** Các NPC di chuyển! Bạn PHẢI quyết định vị trí của họ cho mỗi buổi (Sáng, Trưa, Chiều, Tối) và trả về trong "updatedNpcLocations".
    *   **Aelin (Nhà thảo mộc học):** Thích ở trong Túp lều (TUP_LEU_AELIN), nhưng có thể đi vào Rừng (RUNG) vào những ngày nắng đẹp.
    *   **Kael (Thợ rèn):** Gần như luôn ở Lò Rèn (LO_REN_CUA_KAEL).
    *   **Elara (Tinh linh):** Chỉ xuất hiện ở Bờ Hồ (BO_HO_YEN_A) vào buổi Tối. Những lúc khác, vị trí của cô ấy là \`null\`.
2.  **Sự kiện Thế giới:** Vào buổi SÁNG, có 25% cơ hội tạo ra một "worldEvent" nhỏ (ví dụ: mưa sao băng, đàn bướm bay qua) để làm ngày mới thêm đặc biệt.
3.  **Hệ thống Yêu cầu (Quest):**
    *   Khi người chơi nói chuyện với NPC ("TALK_TO_AELIN", v.v.), có cơ hội tạo một lựa chọn "ACCEPT_REQUEST" với một "requestGained" mới. Yêu cầu phải hợp lý với NPC đó (Aelin cần thảo dược, Kael cần khoáng sản).
    *   Nếu người chơi đang nói chuyện với đúng NPC và có đủ vật phẩm cho một yêu cầu đang hoạt động, hãy tạo một lựa chọn "COMPLETE_REQUEST" với "requestToCompleteId".

**Logic Tiến trình & Sự kiện:**
- **Gặp gỡ:** Giữ nguyên logic khám phá NPC lần đầu (DISCOVER_AELIN_HUT, DISCOVER_KAEL, DISCOVER_ELARA).
- **Tương tác:** Khi người chơi ở cùng địa điểm với một NPC (dựa trên "updatedNpcLocations" bạn tạo ra), hãy tạo sự kiện gặp gỡ và lựa chọn nói chuyện ("TALK_TO_...").
- **Logic khác:** Giữ nguyên logic xây nhà, trồng trọt, câu cá, sức mạnh thần rừng, và lễ hội.
- **Quan trọng:** Phản ánh MÙA, BUỔI, ĐỊA ĐIỂM và đặc biệt là **THỜI TIẾT** (${playerState.weather}) trong các mô tả, sự kiện và lời nhắc hình ảnh. Ví dụ, nếu Kael đang ở lò rèn, nhưng trời mưa, mô tả nên có cảnh "những giọt mưa gõ lách tách trên mái lò rèn".`;
    
    // Game Logic Hints
    const isPlayerAt = (location: Location) => playerState.location === location;
    const isNpcAt = (npc: NPCName, location: Location) => playerState.npcLocations[npc] === location;

    if (isPlayerAt(Location.RUNG)) {
        if (isNpcAt(NPCName.Aelin, Location.RUNG)) systemPrompt += "\n- GỢI Ý: Aelin đang ở trong rừng! Tạo một cuộc gặp gỡ với bà ấy.";
    }

    if (isPlayerAt(Location.TUP_LEU_AELIN) && isNpcAt(NPCName.Aelin, Location.TUP_LEU_AELIN)) {
        systemPrompt += "\n- GỢI Ý: Người chơi đang ở túp lều của Aelin. Tạo sự kiện tương tác với bà ấy (TALK_TO_AELIN). Cân nhắc đưa ra một yêu cầu (ACCEPT_REQUEST).";
    }

    if (isPlayerAt(Location.LO_REN_CUA_KAEL) && isNpcAt(NPCName.Kael, Location.LO_REN_CUA_KAEL)) {
        systemPrompt += "\n- GỢI Ý: Người chơi đang ở lò rèn của Kael. Tạo sự kiện tương tác với anh ta (TALK_TO_KAEL). Cân nhắc đưa ra một yêu cầu hoặc lựa chọn nâng cấp công cụ.";
    }
    
    if (isPlayerAt(Location.BO_HO_YEN_A)) {
         if (isNpcAt(NPCName.Elara, Location.BO_HO_YEN_A)) {
            systemPrompt += "\n- GỢI Ý: Elara đang ở đây. Tạo sự kiện tương tác với cô ấy (TALK_TO_ELARA).";
         }
         systemPrompt += " Luôn cung cấp lựa chọn 'FISH'.";
    }

    return systemPrompt;
}

export const generateGameEvent = async (history: string[], playerState: PlayerState): Promise<GameEvent> => {
    const systemInstruction = getSystemPrompt(playerState);
    const historyString = history.slice(-5).join('\n');
    const inventoryString = playerState.inventory.map(i => i.name).join(', ') || 'trống';
    
    const prompt = `Lịch sử gần đây:\n${historyString}\n\nTrạng thái người chơi: Ngày ${playerState.day}, Mùa ${playerState.season}, Buổi ${playerState.timeOfDay}, tại ${playerState.location}, Thời tiết ${playerState.weather}. Linh hồn: ${playerState.spirit}. Tình bạn Aelin: ${playerState.aelinFriendship}, Kael: ${playerState.kaelFriendship}, Elara: ${playerState.elaraFriendship}. Túi đồ: ${inventoryString}.\nHãy tạo một sự kiện mới.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: eventSchema,
            systemInstruction,
        },
    });

    try {
        const jsonText = response.text.trim();
        const eventData: GameEvent = JSON.parse(jsonText);
        return eventData;
    } catch (e) {
        console.error("Lỗi phân tích JSON từ API:", e);
        console.error("Phản hồi nhận được:", response.text);
        throw new Error("Không thể hiểu được lời thì thầm của khu rừng.");
    }
};

export const generateEventImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image.imageBytes;
        if (!base64ImageBytes) {
            console.warn("API không trả về hình ảnh, sử dụng hình ảnh trống.");
            return "";
        }
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Lỗi tạo hình ảnh:", error);
        return ""; // Return a blank string or a placeholder URL on error
    }
};

export const generateChoiceFromInput = async (userInput: string, playerState: PlayerState): Promise<Choice> => {
    const gameLogicPrompt = getSystemPrompt(playerState);

    const systemInstruction = `Bạn là bộ não logic của trò chơi "Thung Lũng An Yên". Vai trò của bạn là diễn giải hành động do người chơi nhập vào và chuyển nó thành một đối tượng JSON **Choice** duy nhất, hợp lệ.

**QUY TRÌNH BẮT BUỘC:**
1.  **Phân tích đầu vào:** Xem xét hành động người chơi muốn làm: "${userInput}".
2.  **Xem xét bối cảnh:** Dựa trên trạng thái hiện tại của người chơi (vị trí, túi đồ, thời gian, v.v.). Đặc biệt chú ý xem người chơi có ở cùng địa điểm với NPC nào không.
3.  **Áp dụng logic game:** Sử dụng các quy tắc logic game được cung cấp dưới đây để quyết định xem hành động có khả thi không.
4.  **Tạo đối tượng Choice:**
    *   **Hành động hợp lệ:** Nếu người chơi có thể thực hiện hành động (ví dụ: "hoàn thành nhiệm vụ" khi nói chuyện với Aelin và có đủ vật phẩm), hãy tạo một đối tượng Choice với \`actionType\` phù hợp và các hiệu ứng tương ứng (vật phẩm nhận được, thay đổi chỉ số).
    *   **Hành động không hợp lệ:** Nếu hành động là không thể (ví dụ: "nói chuyện với Kael" khi đang ở trong rừng), hãy tạo một đối tượng Choice với \`actionType: "DEFAULT"\` và một 'outcome' nhẹ nhàng giải thích tại sao họ không thể làm điều đó.
5.  **BẮT BUỘC tuân thủ JSON:** Phản hồi của bạn PHẢI là một đối tượng JSON duy nhất khớp với schema của Choice.

---
**QUY TẮC LOGIC GAME:**
${gameLogicPrompt}
---
`;

    const prompt = `Hành động của người chơi: "${userInput}".\nHãy tạo đối tượng JSON Choice tương ứng.`;

     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: choiceSchema,
            systemInstruction,
        },
    });

    try {
        const jsonText = response.text.trim();
        const choiceData: Choice = JSON.parse(jsonText);
        return choiceData;
    } catch (e) {
        console.error("Lỗi phân tích JSON từ API (generateChoiceFromInput):", e);
        console.error("Phản hồi nhận được:", response.text);
        throw new Error("Không thể diễn giải hành động của bạn.");
    }
}