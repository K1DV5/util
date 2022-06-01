# This is a simple port-forward / proxy, written using only the default python
# library.
# adapted from https://github.com/voorloopnul/proxy
# Added ability to separately handle raw TCP and HTTP connections
import socket
import select
import sys

buffer_size = 4096

forward_to = ('localhost', 3000)
forward_to_raw = ('localhost', 600)

http_starts = [verb.encode() + b' ' for verb in ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']]

class TheServer:
    input_list = []
    channel = {}

    def __init__(self, host, port):
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server.bind((host, port))
        self.server.listen(200)

    def main_loop(self):
        self.input_list.append(self.server)
        while True:
            ss = select.select
            inputready, _, _ = ss(self.input_list, [], [])
            for s in inputready:
                if s == self.server:  # first connect
                    self.on_accept()
                    break
                try:
                    data = s.recv(buffer_size)
                except (ConnectionResetError, ConnectionAbortedError):
                    data = None
                if not data:
                    self.on_close(s)
                    break
                self.on_recv(s, data)

    def create_foward(self, host, port):
        forward = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            forward.connect((host, port))
            return forward
        except Exception as inst:
            print("[exception] - {0}".format('\n'.join(inst.args)))
            return False    

    def on_accept(self):
        clientsock, _ = self.server.accept()
        self.input_list.append(clientsock)

    def connect_forward(self, s, raw=False):
        host = forward_to
        if raw:
            host = forward_to_raw
        forward = self.create_foward(host[0], host[1])
        if forward:
            # print("{0} has connected".format(clientaddr))
            self.input_list.append(forward)
            self.channel[s] = forward
            self.channel[forward] = s
        else:
            print("Can't establish a connection with remote server. Closing connection with client side {0}".format(s))
            s.close()

    def on_close(self, s):
        # print("{0} has disconnected".format(s.getpeername()))
        #remove objects from input_list
        self.input_list.remove(s)
        # close the connection with client
        s.close()
        if s not in self.channel:  # close requested before connecting to upstream
            return
        forward = self.channel[s]
        # close the connection with remote server
        forward.close()
        self.input_list.remove(forward)
        # delete both objects from channel dict
        del self.channel[s]
        del self.channel[forward]

    def on_recv(self, s, data):
        if s == self.server:
            return self.channel[s].send(data)
        if s not in self.channel:
            for hstart in http_starts:
                if data.startswith(hstart):
                    self.connect_forward(s)
                    break
            else:
                print('tcp')
                self.connect_forward(s, True)
        self.channel[s].send(data)

if __name__ == '__main__':
        server = TheServer('', 9090)
        try:
            server.main_loop()
        except KeyboardInterrupt:
            print("Ctrl C - Stopping server")
            sys.exit(1)
