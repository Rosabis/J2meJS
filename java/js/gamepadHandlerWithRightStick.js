// 配置参数
const GAMEPAD_CONFIG = {
    deadzone: 0.1,               // 摇杆死区
    stickActivationThreshold: 0.5, // 摇杆方向激活阈值
    triggerActivationThreshold: 0.1 // 扳机键激活阈值
};

// 全局状态管理
const gamepadState = {
    gamepad: null,
    isRunning: false,
    previous: {
        buttons: [],
        axes: [],
        stickDirections: {
            // 左摇杆方向
            'left-up': false,
            'left-down': false,
            'left-left': false,
            'left-right': false,
            // 右摇杆方向
            'right-up': false,
            'right-down': false,
            'right-left': false,
            'right-right': false
        },
        triggers: {
            left: false,
            right: false
        }
    }
};

// 初始化
function initGamepadHandler() {
    console.log("游戏手柄处理工具已初始化");
    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);
    checkExistingGamepads();
}

// 检查已连接的手柄
function checkExistingGamepads() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gamepadState.gamepad = gamepads[i];
            initStateTracking(gamepadState.gamepad);
            startMonitoring();
            handleInputEvent('system', 'connected', gamepadState.gamepad.id);
            break;
        }
    }
}

// 初始化状态跟踪
function initStateTracking(gamepad) {
    gamepadState.previous.buttons = new Array(gamepad.buttons.length).fill(false);
    gamepadState.previous.axes = new Array(gamepad.axes.length).fill(0);
}

// 手柄连接处理
function handleConnect(event) {
    gamepadState.gamepad = event.gamepad;
    initStateTracking(gamepadState.gamepad);
    startMonitoring();
    handleInputEvent('system', 'connected', event.gamepad.id);
}

// 手柄断开处理
function handleDisconnect(event) {
    handleInputEvent('system', 'disconnected', event.gamepad.id);
    gamepadState.gamepad = null;
    gamepadState.isRunning = false;
}

// 开始监控
function startMonitoring() {
    if (!gamepadState.isRunning && gamepadState.gamepad) {
        gamepadState.isRunning = true;
        gameLoop();
    }
}

// 游戏循环
function gameLoop() {
    if (!gamepadState.gamepad) {
        gamepadState.isRunning = false;
        return;
    }

    const updatedGamepad = navigator.getGamepads()[gamepadState.gamepad.index];
    if (updatedGamepad) {
        gamepadState.gamepad = updatedGamepad;
        processInputs();
    }

    requestAnimationFrame(gameLoop);
}

// 处理所有输入
function processInputs() {
    processButtons();
    processAxes();
    processTriggers();
}

// 处理按钮
function processButtons() {
    gamepadState.gamepad.buttons.forEach((button, index) => {
        const isPressed = button.pressed;
        if (isPressed !== gamepadState.previous.buttons[index]) {
            // 调用统一处理函数
            handleInputEvent(
                'button',
                isPressed ? 'pressed' : 'released',
                index,
                { value: button.value }
            );
            gamepadState.previous.buttons[index] = isPressed;
        }
    });
}

// 处理摇杆
function processAxes() {
    const axes = gamepadState.gamepad.axes;

    // 处理左摇杆 (通常是前两个轴)
    if (axes.length >= 2) {
        const x = Math.abs(axes[0]) < GAMEPAD_CONFIG.deadzone ? 0 : axes[0];
        const y = Math.abs(axes[1]) < GAMEPAD_CONFIG.deadzone ? 0 : axes[1];

        // 上
        const isUp = y <= -GAMEPAD_CONFIG.stickActivationThreshold;
        if (isUp !== gamepadState.previous.stickDirections['left-up']) {
            handleInputEvent('stick', isUp ? 'pressed' : 'released', 'left-up', { x, y });
            gamepadState.previous.stickDirections['left-up'] = isUp;
        }

        // 下
        const isDown = y >= GAMEPAD_CONFIG.stickActivationThreshold;
        if (isDown !== gamepadState.previous.stickDirections['left-down']) {
            handleInputEvent('stick', isDown ? 'pressed' : 'released', 'left-down', { x, y });
            gamepadState.previous.stickDirections['left-down'] = isDown;
        }

        // 左
        const isLeft = x <= -GAMEPAD_CONFIG.stickActivationThreshold;
        if (isLeft !== gamepadState.previous.stickDirections['left-left']) {
            handleInputEvent('stick', isLeft ? 'pressed' : 'released', 'left-left', { x, y });
            gamepadState.previous.stickDirections['left-left'] = isLeft;
        }

        // 右
        const isRight = x >= GAMEPAD_CONFIG.stickActivationThreshold;
        if (isRight !== gamepadState.previous.stickDirections['left-right']) {
            handleInputEvent('stick', isRight ? 'pressed' : 'released', 'left-right', { x, y });
            gamepadState.previous.stickDirections['left-right'] = isRight;
        }
    }

    // 处理右摇杆 (通常是后两个轴)
    if (axes.length >= 4) {
        const x = Math.abs(axes[2]) < GAMEPAD_CONFIG.deadzone ? 0 : axes[2];
        const y = Math.abs(axes[3]) < GAMEPAD_CONFIG.deadzone ? 0 : axes[3];

        // 上
        const isUp = y <= -GAMEPAD_CONFIG.stickActivationThreshold;
        if (isUp !== gamepadState.previous.stickDirections['right-up']) {
            handleInputEvent('stick', isUp ? 'pressed' : 'released', 'right-up', { x, y });
            gamepadState.previous.stickDirections['right-up'] = isUp;
        }

        // 下
        const isDown = y >= GAMEPAD_CONFIG.stickActivationThreshold;
        if (isDown !== gamepadState.previous.stickDirections['right-down']) {
            handleInputEvent('stick', isDown ? 'pressed' : 'released', 'right-down', { x, y });
            gamepadState.previous.stickDirections['right-down'] = isDown;
        }

        // 左
        const isLeft = x <= -GAMEPAD_CONFIG.stickActivationThreshold;
        if (isLeft !== gamepadState.previous.stickDirections['right-left']) {
            handleInputEvent('stick', isLeft ? 'pressed' : 'released', 'right-left', { x, y });
            gamepadState.previous.stickDirections['right-left'] = isLeft;
        }

        // 右
        const isRight = x >= GAMEPAD_CONFIG.stickActivationThreshold;
        if (isRight !== gamepadState.previous.stickDirections['right-right']) {
            handleInputEvent('stick', isRight ? 'pressed' : 'released', 'right-right', { x, y });
            gamepadState.previous.stickDirections['right-right'] = isRight;
        }
    }
}

// 处理扳机键
function processTriggers() {
    const buttons = gamepadState.gamepad.buttons;

    // 左扳机
    if (buttons.length >= 7) {
        const value = buttons[6].value;
        const isActive = value >= GAMEPAD_CONFIG.triggerActivationThreshold;
        if (isActive !== gamepadState.previous.triggers.left) {
            handleInputEvent(
                'trigger',
                isActive ? 'pressed' : 'released',
                'left',
                { value }
            );
            gamepadState.previous.triggers.left = isActive;
        }
    }

    // 右扳机
    if (buttons.length >= 8) {
        const value = buttons[7].value;
        const isActive = value >= GAMEPAD_CONFIG.triggerActivationThreshold;
        if (isActive !== gamepadState.previous.triggers.right) {
            handleInputEvent(
                'trigger',
                isActive ? 'pressed' : 'released',
                'right',
                { value }
            );
            gamepadState.previous.triggers.right = isActive;
        }
    }
}

// 统一的输入事件处理函数
function handleInputEvent(type, action, key, data = {}) {
    // 输出统一格式的信息
    console.log({
        timestamp: new Date().toISOString(),
        type: type,
        action: action,
        key: key,
        data: data
    });


    if (action === 'connected' || action === 'disconnected') {
        setTimeout(async () => {
            const modalContent = document.createElement('div');
            modalContent.innerHTML = `<h3 id="GP" >
      <span style="color:#000;font-size:16px;">官方提示:</span>
      <span style="color:#23ab14;font-size:16px;">${action === 'connected' ? '手柄对接成功' : '手柄已经断开'}</span>
      </h3>
      <p style="margin:.5;">
      <span style="color:#000;font-size:16px;">手柄型号:</span>
      <span style="color:#23ab14;font-size:16px;">${key}</span>
      </p>`;
            const selectionModal = createModal({
                contentElement: modalContent,
            });
            selectionModal.show();
            await new Promise(c => setTimeout(c, 3000));
            selectionModal.hide();
        }, 500);
    }

    const keyboard = {
        '0': 42,
        '1': 35,
        '2': 53,
        '3': 48,
        '4': -6,
        '5': -7,
        '9': -5,
        '12': -1,
        '13': -2,
        '14': -3,
        '15': -4,
        'left-up': -1,
        'left-down': -2,
        'left-left': -3,
        'left-right': -4,
        'right-up': 49,
        'right-down': 51,
        'right-left': 55,
        'right-right': 57

    };

    if (keyboard[key]) {
        console.log(keyboard[key]);
        if (action == 'pressed') {
            console.log(keyboard[key] + '按下');
            if (window.MIDP && typeof window.MIDP.sendKeyPress === 'function') {
                window.MIDP.sendKeyPress(keyboard[key])

            }
        } else if (action == 'released') {
            console.log(keyboard[key] + '抬起');
            if (window.MIDP && typeof window.MIDP.sendKeyRelease === 'function') {
                window.MIDP.sendKeyRelease(keyboard[key])

            }
        }
    }

}

// 页面加载后初始化
window.addEventListener('load', initGamepadHandler);

function createModal(options) {
    const {
        contentElement,
        onClose = () => { }
    } = options;

    // 创建覆盖层
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    overlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    overlay.style.zIndex = '9999';

    // 创建模态框
    const modal = document.createElement('div');
    modal.style.backgroundColor = 'white';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    modal.style.padding = '20px';
    modal.style.width = '400px';
    modal.style.transform = 'scale(0.8)';
    modal.style.transition = 'transform 0.3s ease';

    // 创建关闭按钮
    const closeButton = document.createElement('span');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '20px';
    closeButton.style.color = '#888';
    closeButton.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        onClose();
    });

    // 将传入的内容元素添加到模态框
    modal.appendChild(contentElement);
    // 将关闭按钮添加到模态框
    modal.appendChild(closeButton);

    // 将模态框添加到覆盖层
    overlay.appendChild(modal);

    // 将覆盖层添加到文档中
    document.body.appendChild(overlay);

    return {
        show: () => {
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            modal.style.transform = 'scale(1)';
        },
        hide: () => {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            onClose();
        }
    };
}