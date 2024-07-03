window.onload = function (searchString, position) {
    var websocket = new WebSocket("ws://20.115.9.133:8080/ws");
    var playerId;
    var token = localStorage.getItem('userToken');

    function handleScoreChange(action) {
        var score = prompt("请输入分数（1～1000000）:");
        if (score === null) {
            return;
        }
        score = parseInt(score, 10);
        if (isNaN(score) || score < 1 || score > 1000000) {
            alert("输入无效。请输入一个在1～1000000之间的数字😅");
            if (score === null) {
                return;
            }
            return;
        }
        // 获取当前分数池的分数
        var scorePoolElement = document.getElementById("score-pool");
        var scorePool = parseInt(scorePoolElement.textContent.split(": ")[1], 10);

        // 检查操作是否会导致分数池的分数小于0
        if (action === "take_from_pool" && score > scorePool) {
            alert("大哥，分数池里没这么多分😅");
            return;
        }

        websocket.send(JSON.stringify({"action": action, "score": score, "player_id": playerId}));
    }

    function update_game(players) {  //未确认
            /*
            players数据结构 = [{
            "1": {
            "id": "1",
            "name": "player1",
            "score": 100 },

            "2": {
            "id": "2",
            "name": "player2",
            "score": 200 }
            }]
            */
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            var playerElement = document.getElementById(player.id);
            if (playerElement) {
                playerElement.textContent = `${player.name}: ${player.score} 分`;
            } else {
                var list = document.getElementById("players-list");
                var playerEntry = document.createElement("div");
                playerEntry.id = player.id;
                playerEntry.textContent = `${player.name}: ${player.score} 分`;
                list.appendChild(playerEntry);
            }
        }
    }

    websocket.onopen = function(event) {
        if (token) {
            websocket.send(JSON.stringify({"action": "connect_with_token", "token": token}));
        } else {
            requestIDAuthentication();
        }
    };

    function requestIDAuthentication() {
        var player_id = prompt("输入你的8位数生日作为ID，如19990722");
            if (player_id === null) {
                alert("操作取消，请刷新页面重新开始😅");
                return;
            }
            while (true) {
                if (player_id === "1" || player_id === "2" || player_id === "3") {
                    break;
                }
                if (player_id.length !== 8 || isNaN(player_id) || player_id < 19800000 || player_id > 20080000) {
                    player_id = prompt("输8位数生日😅");
                    if (player_id === null) {
                        alert("操作取消，请刷新页面重新开始😅");
                        return;
                    }
                } else {
                    break;
                }
            }
            var player_name = prompt("输入你游戏内的名字");
            if (player_id === null) {
                alert("操作取消，请刷新页面重新开始😅");
                return;
            }
            while (player_name.length === 0|| player_name.length > 15|| /\d/.test(player_name)){
                player_name = prompt("输入无效。请重新输入你游戏内使用的名字(中文或英文)😅");
                if (player_name === null) {
                    alert("操作取消，请刷新页面重新开始😅");
                    return;
                }
            }
            websocket.send(JSON.stringify({"action": "id_connection", "player_id": player_id, "player_name": player_name}));
    }


    websocket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        var systemMessages = document.getElementById("system-messages");
        var joinMessages = document.getElementById("join-messages");
        var scorePoolElement = document.getElementById("score-pool");
        var players = data.players;

        switch(data.action) {
            case "reconnect_failed":
                localStorage.removeItem('userToken');
                requestIDAuthentication();
                break;
            case "reconnect_success":
            case "id_connection_success": //?
                localStorage.setItem('userToken', data.token);
                playerId = data.player_id;
                console.log("收到token:", data); // 调试用
                break;
            case "recent_messages":
                var messages = data.message;
                messages.forEach(function(message) {
                    var messageElement = document.createElement("div");
                    messageElement.textContent = message;
                    systemMessages.appendChild(messageElement);
                });
                // 滚动到消息框底部
                systemMessages.scrollTop = systemMessages.scrollHeight;
                break;

            case "update":
                update_game(players);
                scorePoolElement.innerHTML = `分数池: <span class="highlight">${data.score_pool}</span> 分`;

                var messageElement = document.createElement("div");
                messageElement.textContent = data.message;
                systemMessages.appendChild(messageElement);

                systemMessages.scrollTop = systemMessages.scrollHeight;
                break;

            case "message":
                var messageElement = document.createElement("div");
                messageElement.textContent = data.message;
                joinMessages.appendChild(messageElement);

                // 滚动到消息框底部
                joinMessages.scrollTop = joinMessages.scrollHeight;
                break;
        }
    };

    // 给分和取分按钮事件绑定
    document.getElementById("add-score").addEventListener("click", function() {
        handleScoreChange("add_to_pool");
    });

    document.getElementById("take-score").addEventListener("click", function() {
        handleScoreChange("take_from_pool");
    });
};

document.getElementById('toggle-players-list').addEventListener('click', function() {
    var playerListPopup = document.getElementById('players-list-popup');
    if (playerListPopup.style.display === "none") {
        playerListPopup.style.display = "block";
    } else {
        playerListPopup.style.display = "none";
    }
});

// 在文档上禁用双击事件
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('dblclick', function(event) {
        event.preventDefault();
        event.stopPropagation();
    }, true);

    document.addEventListener('touchmove', function(event) {
        // 当触摸点数量大于1（即双指操作）时
        if (event.touches.length > 1) {
            // 阻止事件的默认行为，例如页面缩放
            event.preventDefault();
        }
    }, { passive: false });
});





