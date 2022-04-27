import { OnConnect, SocketController } from "socket-controllers";
 
@SocketController()
class MainController
{
    @OnConnect()
    public onConnection()
    {
        
    }
}