from aiohttp import web
import aiohttp
import json
from collections import deque
import uuid

players = {}

# players dict list
players_keys = {}  # 结构：{player_id: token}

# 分数池
score_pool = 0

recent_messages = deque(maxlen=100)


async def broadcast(message=None):  # 广播消息 与分数相关
    if message is not None:
        recent_messages.append(message)

    # 遍历所有在线玩家并发送公共消息
    for player in players.values():
        if not player["websocket"].closed:
            await player["websocket"].send_str(json.dumps({
                "action": "update",
                "players": [{"id": pid, "name": p["name"], "score": p["score"]} for pid, p in players.items()],
                "score_pool": score_pool,
                "message": message
            }))


async def broadcast_msg_only(message):
    # 仅发送加入和离开信息 不更新任何分数相关数据
    for player in players.values():
        if not player["websocket"].closed:
            await player["websocket"].send_str(json.dumps({
                "action": "message",
                "message": message
            }))


async def handle_player(request):
    global score_pool
    player_id = None
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    # ws的基本构造：ws = web.WebSocketResponse() 内部是一个asyncio.Queue，用于存储消息，以及一个状态标志 也就是msg.type和msg.data

    try:
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                data = json.loads(msg.data)
                action = data.get("action")

                # 尝试通过token进行重连
                if action == "connect_with_token":
                    # 尝试使用Token进行重连
                    token = data.get("token", None)

                    if token in players_keys.values():
                        messages = [message for message in recent_messages]
                        await ws.send_str(json.dumps({"action": "recent_messages", "message": messages}))

                        # Token验证成功
                        for pid, tkn in players_keys.items():
                            if tkn == token:
                                player_id = pid
                                break
                        player_name = players[player_id]["name"]
                        players[player_id]["websocket"] = ws

                        await ws.send_str(json.dumps({
                            "action": "reconnect_success",
                            "player_id": player_id,  # 当前玩家ID
                            "token": token,  # 当前玩家Token
                        }))
                        await broadcast()
                        await broadcast_msg_only(f"{player_name} 睡醒了")

                    else:
                        # Token验证失败，要求客户端通过ID进行连接
                        await ws.send_str(json.dumps({"action": "reconnect_failed"}))

                elif action == "id_connection":
                    # 使用id和名字进行连接
                    player_id = data.get("player_id")
                    player_name = data.get("player_name")

                    if player_id not in players_keys:  # 如果用户不存在，则创建新用户
                        token = str(uuid.uuid4())
                        players[player_id] = {"name": player_name, "score": 0, "websocket": ws}
                        players_keys[player_id] = token

                        messages = [message for message in recent_messages]
                        await ws.send_str(json.dumps({"action": "recent_messages", "message": messages}))

                        await ws.send_str(json.dumps({
                            "action": "id_connection_success",
                            "player_id": player_id,  # 当前玩家ID
                            "token": token,  # 当前玩家Token
                        }))

                        await broadcast()
                        await broadcast_msg_only(f"{player_name} 进入了房间")

                    else:
                        messages = [message for message in recent_messages]
                        await ws.send_str(json.dumps({"action": "recent_messages", "message": messages}))

                        players[player_id]["websocket"] = ws
                        token = players_keys[player_id]

                        await ws.send_str(json.dumps({
                            "action": "reconnect_success",
                            "player_id": player_id,  # 当前玩家ID
                            "token": token,  # 当前玩家Token
                        }))
                        await broadcast()
                        await broadcast_msg_only(f"{player_name} 睡醒了")

                elif action == "take_from_pool":
                    # 从分数池提取分数
                    score = data.get("score")
                    player_id = data.get("player_id")
                    players[player_id]["score"] += score
                    score_pool -= score
                    await broadcast(f"{players[player_id]['name']} 取了 {score} 分")

                elif action == "add_to_pool":
                    # 向分数池添加分数
                    score = data.get("score")
                    player_id = data.get("player_id")
                    players[player_id]["score"] -= score
                    score_pool += score
                    await broadcast(f"{players[player_id]['name']} 给了 {score} 分")

    finally:
        # 当WebSocket连接关闭时，处理 "disconnect" 操作
        if player_id in players:
            player_name = players[player_id]["name"]
            await broadcast()
            await broadcast_msg_only(f"{player_name} 正在梦游😴")

    return ws


app = web.Application()
app.router.add_route('GET', '/ws', handle_player)
app.router.add_static('/', path='.', name='static')


web.run_app(app, host='0.0.0.0', port=8080)
