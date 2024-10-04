const VERSION_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
let selectedMainRunes = [];
let selectedSubRunes = [];
let selectedSubRuneCount = 0;
let allRunes = [];
let allStatMods = [];
let selectedShardSlots = [null, null, null]; // 수정: 룬 파편 슬롯 3개로 초기화

// 룬 파편 아이콘의 기본 URL 상수 정의
const STAT_MODS_BASE_URL = 'https://raw.communitydragon.org/latest/game/assets/perks/statmods/';

// 투명한 80x80 PNG 이미지 데이터 URL (빈 이미지 대체용)
const emptyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABF0lEQVQ4T63TsU3DMBAG4KchRxcCJITmBm9qMHEj5CdbVD3JSCmR+DDO0xT4dBiWkqYlUdo0gCJ6IIAWlD8V9GSRGmScGuaoRvPHb4RkSg3f13WQc5mPGff6u8nGiyUgHizA+om5Eo7jZecfScQiANgUyl0AoZ0hVYKYL6I0XQDAQRCCXomhSYE9qAJ8lN0B4JmELZqymQGpaRIAXwrjeNqv+Nq+ajO6NOYZDxAPMdGRhbOw4H/5QiXm3wdY1iK2AeuvrkJpJ6GYRruBrh2Lj7hDxi9vn97BGwe8gE2r7BvAAAAAElFTkSuQmCC';

// 최신 버전 가져오기
async function getCurrentVersion() {
    const response = await fetch(VERSION_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch version data: ${response.statusText}`);
    }
    const versions = await response.json();
    return versions[0];
}

// 룬 데이터 가져오기
async function getRunesData(version) {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/runesReforged.json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch runes data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

// 하드코딩된 룬 파편 데이터 정의 (아이콘 경로 업데이트됨)
function getStatModsData() {
    return [
        // 1번 슬롯: 적응형, 공격, 스킬가속
        [
            {
                name: "적응형 능력치 +9 (공격력 +5.4 또는 주문력 +9)",
                icon: `${STAT_MODS_BASE_URL}statmodsadaptiveforceicon.png`,
            },
            {
                name: "공격 속도 +10%",
                icon: `${STAT_MODS_BASE_URL}statmodsattackspeedicon.png`,
            },
            {
                name: "스킬 가속 +8",
                icon: `${STAT_MODS_BASE_URL}statmodscdrscalingicon.png`,
            },
        ],
        // 2번 슬롯: 적응형, 이동속도, 체력증가
        [
            {
                name: "적응형 능력치 +9 (공격력 +5.4 또는 주문력 +9)",
                icon: `${STAT_MODS_BASE_URL}statmodsadaptiveforceicon.png`,
            },
            {
                name: "이동 속도 +10%",
                icon: `${STAT_MODS_BASE_URL}statmodsmovementspeedicon.png`,
            },
            {
                name: "체력 +65",
                icon: `${STAT_MODS_BASE_URL}statmodshealthplusicon.png`,
            },
        ],
        // 3번 슬롯: 체력, 강인함 및 둔화저항, 체력증가
        [
            {
                name: "체력 +65",
                icon: `${STAT_MODS_BASE_URL}statmodshealthscalingicon.png`,
            },
            {
                name: "강인함 +6 및 둔화 저항 +6",
                icon: `${STAT_MODS_BASE_URL}statmodstenacityicon.png`,
            },
            {
                name: "체력 스케일링 +65",
	icon: `${STAT_MODS_BASE_URL}statmodshealthplusicon.png`,
            },
        ],
    ];
}

// 주룬 및 서브룬 이미지 렌더링 함수
function renderRuneImages(runeTree, containerId, isMainPage = true) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Element with ID '${containerId}' not found.`);
        return;
    }
    container.innerHTML = '';

    runeTree.forEach(tree => {
        const img = document.createElement('img');
        img.src = `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`;
        img.alt = tree.name;
        img.width = 80;
        img.height = 80;
        img.crossOrigin = "anonymous";
        img.title = tree.name;
        img.onclick = () => {
            if (isMainPage) {
                selectMainRune(tree, 'mainSecondaryRuneImages', img);
            } else {
                selectSubRune(tree, 'subSecondaryRuneImages', img);
            }
            const siblingImages = container.querySelectorAll('img');
            siblingImages.forEach(sibling => {
                if (sibling !== img) {
                    sibling.classList.remove('selected');
                    sibling.classList.add('dimmed');
                } else {
                    sibling.classList.add('selected');
                    sibling.classList.remove('dimmed');
                }
            });
        };
        container.appendChild(img);
    });
}

// 주룬 선택 처리 (슬롯별로 룬을 배치)
function selectMainRune(runeData, containerId, selectedImg) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Element with ID '${containerId}' not found.`);
        return;
    }
    container.innerHTML = '';
    selectedMainRunes = []; // 2차원 배열 초기화

    runeData.slots.forEach((slot, slotIndex) => {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('rune-slot');

        selectedMainRunes[slotIndex] = []; // 각 슬롯에 대한 배열 초기화

        slot.runes.forEach((rune, runeIndex) => {
            const img = document.createElement('img');
            img.src = `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
            img.alt = rune.name;
            img.width = 80;
            img.height = 80;
            img.crossOrigin = "anonymous";
            img.title = rune.name;

            img.onclick = () => {
                // 이전에 선택된 룬의 'selected' 클래스 제거
                selectedMainRunes[slotIndex].forEach(img => img.classList.remove('selected'));
                selectedMainRunes[slotIndex] = [img]; // 현재 선택한 룬을 배열에 저장
                img.classList.add('selected');

                // 같은 슬롯 내 다른 룬을 어둡게 만들기
                slotDiv.querySelectorAll('img').forEach(image => {
                    if (image === img) {
                        image.classList.remove('dimmed');
                    } else {
                        image.classList.add('dimmed');
                    }
                });
            };

            slotDiv.appendChild(img);
        });
        container.appendChild(slotDiv);
    });
}

// 서브 주룬 선택 처리 (슬롯별로 룬을 배치) - 첫 번째 슬롯은 건너뜀
function selectSubRune(runeData, containerId, selectedImg) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Element with ID '${containerId}' not found.`);
        return;
    }
    container.innerHTML = '';
    selectedSubRunes = []; // 2차원 배열 초기화
    selectedSubRuneCount = 0;

    // 첫 번째 슬롯 (slotIndex === 0)은 건너뛰고 렌더링
    runeData.slots.forEach((slot, slotIndex) => {
        if (slotIndex === 0) return; // 첫 번째 슬롯 건너뜀

        const slotDiv = document.createElement('div');
        slotDiv.classList.add('rune-slot');

        selectedSubRunes[slotIndex] = [];

        slot.runes.forEach((rune, runeIndex) => {
            const img = document.createElement('img');
            img.src = `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
            img.alt = rune.name;
            img.width = 80;
            img.height = 80;
            img.crossOrigin = "anonymous";
            img.title = rune.name;

            img.onclick = () => {
                if (img.classList.contains('selected')) {
                    img.classList.remove('selected');
                    selectedSubRunes[slotIndex] = selectedSubRunes[slotIndex].filter(i => i !== img);
                    selectedSubRuneCount--;
                } else {
                    if (selectedSubRuneCount >= 2) {
                        alert('부룬은 두 개만 선택할 수 있습니다.');
                        return;
                    }
                    selectedSubRunes[slotIndex].push(img);
                    img.classList.add('selected');
                    selectedSubRuneCount++;
                }
                updateSubRuneDimming();
            };

            slotDiv.appendChild(img);
        });
        container.appendChild(slotDiv);
    });
}

// 서브 페이지에서 룬 선택 시 어둡게 처리
function updateSubRuneDimming() {
    const subRuneImages = document.querySelectorAll('#subSecondaryRuneImages .rune-slot');
    subRuneImages.forEach(slotDiv => {
        slotDiv.querySelectorAll('img').forEach(img => {
            if (img.classList.contains('selected')) {
                img.classList.remove('dimmed');
            } else {
                if (selectedSubRuneCount >= 2) {
                    img.classList.add('dimmed');
                } else {
                    img.classList.remove('dimmed');
                }
            }
        });
    });
}

// 룬 파편 이미지 렌더링 함수 (초기에는 첫 번째 파편만 보이게 설정)
function renderRuneShardImages(statMods) {
    const shardSlots = ['runeShardSlot1', 'runeShardSlot2', 'runeShardSlot3']; // 3개의 슬롯으로 확장
    shardSlots.forEach((slotId, slotIndex) => {
        const container = document.getElementById(slotId);
        if (!container) {
            console.error(`Element with ID '${slotId}' not found.`);
            return;
        }
        container.innerHTML = '';

        statMods[slotIndex].forEach((statMod, statIndex) => {
            const img = document.createElement('img');
            img.src = statMod.icon; // 업데이트된 아이콘 경로 사용
            img.alt = statMod.name;
            img.width = 60;
            img.height = 60;
            img.crossOrigin = "anonymous";
            img.title = statMod.name;

            // 초기 상태에서 첫 번째 파편만 보이도록 설정
            if (statIndex === 0) {
                img.classList.add('selected');
                selectedShardSlots[slotIndex] = statMod;
            } else {
                img.classList.add('hidden'); // 나머지 파편은 숨김
            }

            img.onclick = () => {
                // 선택된 파편이 아닌 것을 클릭한 경우
                if (!img.classList.contains('selected')) {
                    // 다른 파편 해제
                    container.querySelectorAll('img').forEach(image => {
                        image.classList.remove('selected');
                        image.classList.add('hidden'); // 이전에 선택된 파편을 숨김
                    });

                    // 선택된 파편을 표시
                    img.classList.add('selected');
                    img.classList.remove('hidden');
                    selectedShardSlots[slotIndex] = statMod;
                } else {
                    // 선택된 파편을 클릭하면 나머지 파편을 보이게 함
                    container.querySelectorAll('img').forEach(image => {
                        image.classList.remove('hidden');
                    });
                }
            };

            container.appendChild(img);
        });
    });
}

// 모든 룬 파편 선택 초기화 함수
function resetRuneShards() {
    document.querySelectorAll('.rune-shard-slot img').forEach(img => {
        img.classList.remove('selected', 'hidden');
    });
    selectedShardSlots = [null, null, null]; // 3개의 슬롯으로 초기화
    // 초기화 후, 각 슬롯의 첫 번째 파편만 보이도록 설정
    renderRuneShardImages(allStatMods);
}

// 간격 변수 초기화
let exportSpacing = -460; // 기본 간격 -460px

// 룬 파편 위치 조정을 위한 좌표 변수 초기화
let shardXOffset = -370; // 기본 X 좌표 오프셋
let shardYOffset = 320; // 기본 Y 좌표 오프셋 (서브룬 아래 위치하도록 설정)

// 배경 투명도 및 모서리 둥글기 조정 변수 초기화
let backgroundOpacity = 1.0; // 기본 배경 투명도 (1: 불투명)
let cornerRadius = 0; // 모서리 둥글기 반경 (px)

// 내보내기 이미지 크기 조정을 위한 변수 초기화
let customCanvasWidth = 1000; // 기본 내보내기 이미지 너비 (px)
let customCanvasHeight = 1000; // 기본 내보내기 이미지 높이 (px)

// 왼쪽 및 우측 자르기 설정 변수 추가
let cropLeft = 100; // 왼쪽에서 자를 픽셀 수 (기본값: 100px)
let cropRight = 100; // 우측에서 자를 픽셀 수 (기본값: 100px)

// 텍스트 위치 조정을 위한 변수 추가
let textYOffset = 10; // 텍스트가 캔버스 상단에서부터 떨어진 거리 (기본값: 10px)
let runesYOffset = 90; // 텍스트와 룬 이미지 사이의 간격 (기본값: 20px)

// 텍스트 없는 경우 기본 상하 여백
let defaultVerticalPadding = 50; // 텍스트가 없는 경우 상하 여백 (기본값: 50px)

// 투명도 업데이트 함수
function updateOpacity(value) {
    backgroundOpacity = parseFloat(value);
    document.getElementById('opacityValue').innerText = value;
}

// 모서리 둥글기 업데이트 함수
function updateCornerRadius(value) {
    cornerRadius = parseInt(value, 10);
    document.getElementById('cornerRadiusValue').innerText = value;
}

// 간격 업데이트 함수
function updateSpacing(value) {
    exportSpacing = (value / 100) * -460; // 간격을 퍼센트로 조정 (예: 20% -> -92px)
    document.getElementById('spacingValue').innerText = value;
}

// 내보내기 이미지 너비 조정 함수
function updateCanvasWidth(value) {
    customCanvasWidth = parseInt(value, 10);
    document.getElementById('canvasWidthValue').innerText = value;
}

// 내보내기 이미지 높이 조정 함수
function updateCanvasHeight(value) {
    customCanvasHeight = parseInt(value, 10);
    document.getElementById('canvasHeightValue').innerText = value;
}

// 텍스트 업데이트 함수
function updateText() {
    const text = document.getElementById('textInput').value;
    const textDisplay = document.getElementById('textDisplay');
    textDisplay.textContent = text;
}

// 글자 크기 업데이트 함수
function updateFontSize(value) {
    const textDisplay = document.getElementById('textDisplay');
    textDisplay.style.fontSize = `${value}px`;
    document.getElementById('fontSizeValue').innerText = `${value}px`;
}

// 텍스트 색상 업데이트 함수
function updateTextColor(value) {
    const textDisplay = document.getElementById('textDisplay');
    textDisplay.style.color = value;
}

// 선택된 룬들을 페이지 레이아웃과 동일하게 PNG으로 내보내기
function exportRunes(type) {
    console.log(`Exporting runes: ${type}`);

    const canvas = document.getElementById('exportCanvas');
    if (!canvas) {
        console.error("Canvas element with ID 'exportCanvas' not found.");
        return;
    }
    const ctx = canvas.getContext('2d');

    // 캔버스 크기 설정 및 초기화
    let sectionsToExport = [];
    let totalWidth = 0;
    let maxHeight = 0;

    if (type === 'main') {
        if (hasSelectedRunes('mainSecondaryRuneImages')) {
            sectionsToExport.push(document.getElementById('mainSecondaryRuneImages'));
        }
    } else if (type === 'sub') {
        if (hasSelectedRunes('subSecondaryRuneImages')) {
            sectionsToExport.push(document.getElementById('subSecondaryRuneImages'));
        }
        if (hasSelectedRunes('runeShardSlots')) {
            sectionsToExport.push(document.getElementById('runeShardSlots')); // 서브 페이지 부룬 아래 룬 파편 추가
        }
    } else if (type === 'both' || type === 'transparent') {
        if (hasSelectedRunes('mainSecondaryRuneImages')) {
            sectionsToExport.push(document.getElementById('mainSecondaryRuneImages'));
        }
        if (hasSelectedRunes('subSecondaryRuneImages')) {
            sectionsToExport.push(document.getElementById('subSecondaryRuneImages'));
        }
        if (hasSelectedRunes('runeShardSlots')) {
            sectionsToExport.push(document.getElementById('runeShardSlots')); // 서브 페이지 부룬 아래 룬 파편 추가
        }
    } else {
        console.error(`Unknown export type: ${type}`);
        return;
    }

    if (sectionsToExport.length === 0) {
        alert('내보낼 룬이 선택되지 않았습니다.');
        return;
    }

    // 텍스트 가져오기
    const text = document.getElementById('textInput').value;

    // 텍스트가 없으면 여백을 0으로 설정
    let adjustedTextYOffset = text ? textYOffset : 0;

    // 캔버스 크기 계산
    sectionsToExport.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        totalWidth += rect.width;

        if (index > 0) {
            totalWidth += exportSpacing; // 각 섹션 간의 간격 추가
        }

        if (rect.height > maxHeight) {
            maxHeight = rect.height;
        }
    });

    // 텍스트 영역의 높이 계산
    const textDisplay = document.getElementById('textDisplay');
    const textFontSize = parseInt(window.getComputedStyle(textDisplay).fontSize, 10);
    const textHeight = text ? (textFontSize + Math.abs(adjustedTextYOffset)) : 0;

    // 기본 상하 여백 설정 (텍스트가 없는 경우에도 적용)
    const verticalPadding = text ? 0 : defaultVerticalPadding;

    // 사용자 지정 크기를 설정하고 왼쪽과 우측 자르기 적용
    const canvasWidth = Math.min(customCanvasWidth, totalWidth - cropLeft - cropRight);
    const canvasHeight = Math.min(customCanvasHeight, maxHeight + textHeight + 2 * verticalPadding + (text ? runesYOffset : 0));

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 추가 (검은 배경 + 투명도 적용)
    ctx.fillStyle = `rgba(0, 0, 0, ${backgroundOpacity})`;
    if (cornerRadius > 0) {
        // 모서리를 둥글게 하는 방법
        ctx.beginPath();
        ctx.moveTo(cornerRadius, 0);
        ctx.lineTo(canvasWidth - cornerRadius, 0);
        ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, cornerRadius);
        ctx.lineTo(canvasWidth, canvasHeight - cornerRadius);
        ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - cornerRadius, canvasHeight);
        ctx.lineTo(cornerRadius, canvasHeight);
        ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - cornerRadius);
        ctx.lineTo(0, cornerRadius);
        ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 텍스트 추가 (캔버스 상단에 고정, 텍스트가 있을 경우만)
    if (text) {
        const textColor = document.getElementById('textColor').value;
        const fontSize = document.getElementById('fontSizeRange').value;

        ctx.font = `${fontSize}px 'Gothic A1', sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(text, canvasWidth / 2, adjustedTextYOffset); // 텍스트를 캔버스 상단 중앙에 위치
    }

    // 이미지 로드 및 그리기 함수
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";  // CORS 설정
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    }

    async function drawRunes() {
        try {
            let currentX = -cropLeft; // 왼쪽 잘라내기 적용
            let currentY = textHeight + verticalPadding + (text ? runesYOffset : 0); // 텍스트가 있을 때 이미지 시작 위치 조정

            for (let i = 0; i < sectionsToExport.length; i++) {
                const section = sectionsToExport[i];
                const images = section.querySelectorAll('img');

                // 각 섹션 간의 간격 추가
                if (i > 0) {
                    currentX += exportSpacing;
                }

                for (let imgElement of images) {
                    const imgSrc = imgElement.src;
                    const imgRect = imgElement.getBoundingClientRect();
                    const sectionRect = section.getBoundingClientRect();

                    // 서브 페이지의 룬 파편 위치 조정
                    let yOffset = currentY + (imgRect.top - sectionRect.top);
                    let xOffset = currentX + (imgRect.left - sectionRect.left);

                    if (section.id === 'runeShardSlots') {
                        xOffset += shardXOffset; // X 좌표 오프셋 적용
                        yOffset += shardYOffset; // Y 좌표 오프셋 적용
                    }

                    const img = await loadImage(imgSrc);

                    // 투명화 적용: 선택된 이미지는 불투명도 1.0, 선택되지 않은 이미지는 불투명도 0.3
                    if (type === 'transparent') {
                        ctx.globalAlpha = imgElement.classList.contains('selected') ? 1.0 : 0.0;
                    } else {
                        ctx.globalAlpha = imgElement.classList.contains('selected') ? 1.0 : 0.3;
                    }

                    // 이미지 그리기
                    ctx.drawImage(img, xOffset, yOffset, imgRect.width, imgRect.height);

                    // 선택된 룬일 경우 테두리 그리기
                    if (imgElement.classList.contains('selected')) {
                        ctx.globalAlpha = 1.0; // 테두리는 항상 불투명하게 그리기
                        ctx.strokeStyle = 'lightblue';
                        ctx.lineWidth = 4;
                        ctx.strokeRect(xOffset, yOffset, imgRect.width, imgRect.height);
                    }
                }

                // 현재 X 위치 업데이트 (섹션 너비 + 간격)
                const sectionRect = section.getBoundingClientRect();
                currentX += sectionRect.width;
            }

            // 캔버스를 PNG으로 변환하고 다운로드
            ctx.globalAlpha = 1.0; // 불투명도 초기화
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'runes_export.png';
            link.click();
        } catch (error) {
            console.error('룬 이미지를 그리는 중 오류가 발생했습니다.', error);
        }
    }

    drawRunes();
}

// Helper 함수: 특정 컨테이너에 선택된 룬이 있는지 확인
function hasSelectedRunes(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return false;
    const selectedImages = container.querySelectorAll('img.selected');
    return selectedImages.length > 0;
}

// 리셋 함수 추가 (모든 룬 및 룬 파편 초기화)
function resetAllRunes() {
    // 메인 룬 초기화
    document.querySelectorAll('#mainSecondaryRuneImages .rune-slot img').forEach(img => {
        img.classList.remove('selected', 'dimmed');
    });
    selectedMainRunes = [];

    // 서브 룬 초기화
    document.querySelectorAll('#subSecondaryRuneImages .rune-slot img').forEach(img => {
        img.classList.remove('selected', 'dimmed');
    });
    selectedSubRunes = [];
    selectedSubRuneCount = 0;

    // 룬 파편 초기화
    resetRuneShards();

    // 모든 룬 이미지의 dimmed 클래스 제거
    document.querySelectorAll('.rune-images img').forEach(img => {
        img.classList.remove('dimmed');
    });

    // 선택된 이미지를 초기화
    document.querySelectorAll('.rune-images img').forEach(img => {
        img.classList.remove('selected');
    });
}

// 페이지 로드 시 실행
window.onload = async function () {
    try {
        const version = await getCurrentVersion();
        console.log(`Current version: ${version}`);
        
        const runesData = await getRunesData(version);
        console.log('Fetched runes data:', runesData);
        
        const statModsData = getStatModsData();
        console.log('Using hardcoded statMods data:', statModsData);
        
        allRunes = runesData;
        allStatMods = statModsData;

        renderRuneImages(runesData, 'mainRuneImages', true);
        renderRuneImages(runesData, 'subRuneImages', false);
        renderRuneShardImages(statModsData);
    } catch (error) {
        console.error('데이터를 가져오는 중 오류가 발생했습니다.', error);
    }
};
