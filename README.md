# 游戏计分板应用

该软件是一个联网多人计分板应用，适用于德州扑克/麻将/牌类等游戏。该软件仅用作计分，请勿用于非法用途。

## 功能特性

- 多人在线计分
- 通过按钮增加或减少分数
- 显示玩家列表和分数
- 系统消息和加入消息展示
- 完整分数判定逻辑
- 断线自动重连/手动使用生日进行重连 不丢失分数

## 安装与运行

1. **克隆或下载此仓库:**

   ```
   git clone https://github.com/Joezhou1211/PokerRoom.git
   cd PokerRoom
   ```

2. **部署软件:**
     ```
     如不知道自己的服务器地址 则使用 ifconfig | grep inet
    在输出中找到inet字段中的ip地址 如：192.168.0.23

    修改main.js中的websocket地址的ip字段为获取到的ip字段 -> ws://192.168.0.23:8080/ws
    如果使用托管服务，则修改websocket地址为该服务器的ip地址 ->  如ws://200.16.24.89:8080/ws
  
    修改完成后运行 python3 main.py
  
  
4. **使用软件：**  
  ### 打开应用
    在浏览器中访问`host_ip/8080/templates/index.html`打开应用 
    如果使用本地服务器，请保持所有设备连接到该服务器的同一网络下。
    如果使用托管服务器，请确保其网络稳定性。 
    
  ### 输入生日(Primary_Key)和游戏名字
  
    该生日作为重连的唯一途径，在单次session中有效，如重启服务器将清除cache
  
  ### 管理分数
  
    使用底部的“给分”和“取分”按钮，可以增加或减少分数池中的分数。左上角显示当前分数池的总分，点击玩家列表可以看到所有玩家的当前分数

  <img width="1439" alt="image" src="https://github.com/Joezhou1211/PokerRoom/assets/121386280/f675827d-83fb-4f58-9f18-a85062704169">
  
<img width="1439" alt="image" src="https://github.com/Joezhou1211/PokerRoom/assets/121386280/a0f62dd0-1243-49be-bd53-a0cb8567d316">

<img width="448" alt="image" src="https://github.com/Joezhou1211/PokerRoom/assets/121386280/a09c146d-60cc-45c1-950d-b9852cb5e3ea">

<img width="448" alt="image" src="https://github.com/Joezhou1211/PokerRoom/assets/121386280/1effdb19-5ccf-4b4c-be01-978d0fa5fb46">


   


   
