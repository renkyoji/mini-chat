import React, {useReducer} from 'react';
import LoginForm from "./components/LoginForm";
import reducer from "./reducer";
import socket from "./socket";
import axios from 'axios'
import ChatRoom from "./components/ChatRoom";


function App() {
  const [state, dispatch] = useReducer(reducer, {
    joined: false,
    roomId: null,
    userName: null,
    users: [],
    messages: [],
  });

  const onLogin = async (obj) => {
    dispatch({
      type: 'JOINED',
      payload: obj,
    });
    socket.emit('ROOM:JOIN', obj);
    const { data } = await axios.get(`/rooms/${obj.roomId}`);
    dispatch({
      type: 'SET_DATA',
      payload: data,
    });
  };

  const setUsers = (users) => {
    dispatch({
      type: 'SET_USERS',
      payload: users,
    });
  };

  const addMessage = (message) => {
    dispatch({
      type: 'NEW_MESSAGE',
      payload: message,
    });
  };

  React.useEffect(() => {
    socket.on('ROOM:SET_USERS', setUsers);
    socket.on('ROOM:NEW_MESSAGE', addMessage);
  }, []);

  return (
      <div> { !state.joined ?  <LoginForm onLogin={onLogin}/>
          : <ChatRoom {...state} onAddMessage={addMessage}/> }




      </div>
  );
}

export default App;
